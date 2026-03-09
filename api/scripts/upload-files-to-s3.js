const fs = require('fs');
const AWS = require('aws-sdk');
const { join } = require('path');
const mime = require('mime-types');
const moment = require('moment');
const {
  DB
} = require('../migrations/lib');
const { VideoFileService } = require('../dist/modules/file/services/video.service');

async function uploadSingleFileToS3({
  s3Client,
  s3Bucket,
  s3BucketEnpoint,
  fPath,
  absoluteFPath,
  acl = 'public-read',
  mimeType = null
}) {
  const publicDir = join(__dirname, '..', 'public');

  let filePath = join(publicDir, fPath);
  if (!fs.existsSync(absoluteFPath)) {
    if (!fs.existsSync(filePath)) {
      console.log('File not exist!');
      return Promise.resolve({});
    }
  } else {
    filePath = absoluteFPath;
  }
  const stream = fs.createReadStream(filePath);
  const key = fPath.charAt(0) === '/' ? fPath.substring(1) : fPath;
  console.log(`Uploading ${filePath} to key ${key}`, acl);
  // setting up s3 upload parameters
  const params = {
    Bucket: s3Bucket,
    Key: key,
    Body: stream,
    ACL: acl,
    ContentType: mimeType
  };

  // Uploading files to the bucket
  await s3Client.upload(params).promise();
  const location = `https://${s3BucketEnpoint}/${s3Bucket}/${key}`;

  // remove local file
  fs.unlinkSync(filePath);

  return {
    location,
    key
  };
}

async function createThumbnailForVideo(fPath, absoluteFPath) {
  const publicDir = join(__dirname, '..', 'public');
  const videoDir = join(__dirname, '..', 'public', 'videos');

  let filePath = join(publicDir, fPath);
  if (!fs.existsSync(absoluteFPath)) {
    if (!fs.existsSync(filePath)) {
      console.log('File not exist!');
      return Promise.resolve(null);
    }
  } else {
    filePath = absoluteFPath;
  }

  const videoClass = new VideoFileService();
  const thumbs = await videoClass.createThumbs(filePath, {
    count: 1,
    size: '350x?',
    toFolder: videoDir
  });
  return thumbs.map((thumb) => ({
    path: join(videoDir, thumb).replace(publicDir, ''),
    absolutePath: join(videoDir, thumb)
  }));
}

module.exports = async () => {
  const settings = await DB.collection('settings').find({ group: 's3' }).toArray();
  const valueMap = settings.reduce((res, setting) => {
    res[setting.key] = setting.value;
    return res;
  }, {});

  if (!valueMap.s3Enabled) {
    console.log('S3 is not enabled');
    return;
  }

  // Enter the name of the bucket that you have created here
  const BUCKET_NAME = valueMap.s3BucketName;

  // Initializing S3 Interface
  const s3Client = new AWS.S3({
    signatureVersion: 'v4',
    accessKeyId: valueMap.s3AccessKeyId,
    secretAccessKey: valueMap.s3SecretAccessKey,
    region: valueMap.s3RegionName,
    endpoint: valueMap.s3BucketEnpoint,
    params: {
      Bucket: BUCKET_NAME
    }
  });

  const files = await DB.collection('files').find({
    server: 'diskStorage',
    // name:	"wb1od-group-immunity!-stay-home-and-stay-safe!-full.mp4"
    //	createdAt: {
    //		$lt: moment().add(-2, 'hours').toDate()
    //	},
    type: { $ne: 'setting' }
  }).toArray();
  await files.reduce(async (lp, file) => {
    await lp;
    // console.log('file', file)
    // create thumbnails if any
    if (file.mimeType && file.mimeType.includes('video') && !file.thumbnails?.length) {
      console.log('creating thumbnails');
      const thumbnails = await createThumbnailForVideo(file.path, file.absolutePath);
      console.log(thumbnails);

      // eslint-disable-next-line no-param-reassign
      file.thumbnails = thumbnails;

      // duration
      try {
        const videoClass = new VideoFileService();
        const meta = await videoClass.getMetaData(file.path);
        if (meta?.streams) {
          const stream = meta.streams[0];
          await DB.collection('files').updateOne({ _id: file._id }, {
            $set: {
              duration: stream.duration
            }
          });
        }
      } catch {
      }
    }
    // upload original file
    const mimeType = mime.lookup(file.path);
    const { location, key } = await uploadSingleFileToS3({
      s3Client,
      s3Bucket: BUCKET_NAME,
      s3BucketEnpoint: valueMap.s3BucketEnpoint,
      fPath: file.path,
      absoluteFPath: file.absolutePath,
      acl: file.type === 'video' ? 'authenticated-read' : file.acl || 'public-read',
      mimeType
    });

    if (!location) return Promise.resolve();

    const meta = file.meta || {};
    await DB.collection('files').updateOne({ _id: file._id }, {
      $set: {
        meta: {
          ...meta,
          bucket: BUCKET_NAME,
          endpoint: valueMap.s3BucketEnpoint
        },
        path: location,
        absolutePath: key,
        server: 's3',
        status: 'finished'
      }
    });
    // check if have thumbnails and do upload them
    if (file.thumbnails && file.thumbnails.length) {
      const thumbnails = await file.thumbnails.reduce(async (res, thumbnail) => {
        const results = await res;
        if (!thumbnail.path) return results;
        const mimeType2 = mime.lookup(thumbnail.path);
        const { location: l, key: k } = await uploadSingleFileToS3({
          s3Client,
          s3Bucket: BUCKET_NAME,
          s3BucketEnpoint: valueMap.s3BucketEnpoint,
          fPath: thumbnail.path,
          absoluteFPath: thumbnail.absolutePath,
          acl: 'public-read',
          mimeType: mimeType2
        });
        results.push({
          path: l,
          absolutePath: k
        });
        return results;
      }, Promise.resolve([]));

      await DB.collection('files').updateOne({ _id: file._id }, {
        $set: {
          thumbnails
        }
      });
    }

    // update status in video if any
    const video = await DB.collection('videos').findOne({ fileId: file._id });
    if (video && video.status === 'file-error') {
      console.log('active video');
      await DB.collection('videos').updateOne({ _id: video._id }, {
        $set: {
          status: 'active'
        }
      });
    }

    return Promise.resolve();
  }, Promise.resolve());

  // fix for s3 file video
  const processingVideos = await DB.collection('videos').find({
    $or: [{
      teaserProcessing: true
    }, {
      processing: true
    }]
  }).toArray();

  await processingVideos.reduce(async (lp, video) => {
    await lp;
    if (video.processing && video.fileId) {
      const file = await DB.collection('files').findOne({
        _id: video.fileId
      });
      if (file.status === 'finished') {
        await DB.collection('videos').updateOne({ _id: video._id }, {
          $set: {
            processing: false
          }
        });
      }
    }

    if (video.processing && video.teaserId) {
      const file = await DB.collection('files').findOne({
        _id: video.teaserId
      });
      if (file.status === 'finished') {
        await DB.collection('videos').updateOne({ _id: video._id }, {
          $set: {
            teaserProcessing: false
          }
        });
      }
    }
    return Promise.resolve();
  }, Promise.resolve());
};
