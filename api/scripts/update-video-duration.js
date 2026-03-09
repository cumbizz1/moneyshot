const AWS = require('aws-sdk');
const {
  DB
} = require('../migrations/lib');
const { VideoFileService } = require('../dist/modules/file/services/video.service');

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
    type: 'video',
    duration: null,
    server: 's3'
  }).toArray();

  const videoService = new VideoFileService();
  await files.reduce(async (lp, file) => {
    await lp;
    const url = s3Client.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: file.absolutePath,
      Expires: 300
    });
    try {
      const meta = await videoService.getMetaData(url);
      if (!meta?.streams) return Promise.resolve();
      const stream = meta.streams[0];
      console.log(file.name, stream.duration);
      await DB.collection('files').updateOne({ _id: file._id }, {
        $set: {
          duration: stream.duration
        }
      });
    } catch {
      return Promise.resolve();
    }
    return Promise.resolve();
  }, Promise.resolve());
};
