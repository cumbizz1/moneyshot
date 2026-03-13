import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  createReadStream, existsSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync
} from 'fs';
import * as jwt from 'jsonwebtoken';
import * as mkdirp from 'mkdirp';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { ConfigService } from 'nestjs-config';
import { join } from 'path';
import {
  EntityNotFoundException,
  getConfig, QueueEvent, QueueEventService, StringHelper
} from 'src/kernel';
import { formatFileName } from 'src/kernel/helpers/multer.helper';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { SettingService } from 'src/modules/settings/services';
import { S3ObjectCannelACL, Storage } from 'src/modules/storage/contants';
import { S3Service, S3StorageService } from 'src/modules/storage/services';

import { FileDto } from '../dtos';
import { IFileUploadOptions } from '../lib';
import { IMulterUploadedFile } from '../lib/multer/multer.utils';
import { FileModel } from '../models';
import { FILE_MODEL_PROVIDER } from '../providers';
import { AudioFileService } from './audio.service';
import { ImageService } from './image.service';
import { VideoFileService } from './video.service';

const VIDEO_QUEUE_CHANNEL = 'VIDEO_PROCESS';
const AUDIO_QUEUE_CHANNEL = 'AUDIO_PROCESS';
const PHOTO_QUEUE_CHANNEL = 'PHOTO_PROCESS';

export const FILE_EVENT = {
  VIDEO_PROCESSED: 'VIDEO_PROCESSED',
  PHOTO_PROCESSED: 'PHOTO_PROCESSED',
  AUDIO_PROCESSED: 'AUDIO_PROCESSED'
};

interface FtpOptions {
  fileName: string;
  type: string;
  uploader?: any;
}

@Injectable()
export class FileService {
  constructor(
    @Inject(forwardRef(() => S3StorageService))
    private readonly s3StorageService: S3StorageService,
    @Inject(FILE_MODEL_PROVIDER)
    private readonly fileModel: Model<FileModel>,
    private readonly imageService: ImageService,
    private readonly videoService: VideoFileService,
    private readonly audioFileService: AudioFileService,
    private readonly queueEventService: QueueEventService,
    private readonly config: ConfigService
  ) {
    this.queueEventService.subscribe(
      VIDEO_QUEUE_CHANNEL,
      'PROCESS_VIDEO',
      this._processVideo.bind(this)
    );

    this.queueEventService.subscribe(
      AUDIO_QUEUE_CHANNEL,
      'PROCESS_AUDIO',
      this._processAudio.bind(this)
    );

    this.queueEventService.subscribe(
      PHOTO_QUEUE_CHANNEL,
      'PROCESS_PHOTO',
      this._processPhoto.bind(this)
    );
  }

  public async getFtpFilePath() {
    const ftpDir = SettingService.getValueByKey(SETTING_KEYS.FTP_FOLDER_PATH) || getConfig('file').ftpFileDir;
    if (!existsSync(ftpDir)) return [];
    const files = readdirSync(ftpDir);
    if (!files) {
      return [];
    }
    return files;
  }

  public async createFtpFilePath(options: FtpOptions): Promise<FileDto> {
    const { fileName, type, uploader } = options;
    const publicDir = this.config.get('file.publicDir');
    const ftpDir = SettingService.getValueByKey(SETTING_KEYS.FTP_FOLDER_PATH) || getConfig('file').ftpFileDir;
    const filePath = `${ftpDir}/${fileName}`;
    if (!existsSync(filePath)) return null;
    const stats = statSync(filePath);
    const data = {
      type,
      name: StringHelper.getFileName(filePath, true),
      description: '', // TODO - get from options
      mimeType: '',
      server: 'local',
      // todo - get path from public
      path: filePath.replace(publicDir, ''),
      absolutePath: filePath,
      thumbnails: [],
      status: 'finished',
      size: stats.size,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: uploader ? uploader._id : null,
      updatedBy: uploader ? uploader._id : null
    } as FileModel;

    const file = await this.fileModel.create(data);
    return FileDto.fromModel(file);
  }

  public async findById(id: string | ObjectId): Promise<FileDto> {
    const model = await this.fileModel.findById(id);
    if (!model) return null;
    return new FileDto(model);
  }

  public async findByIds(ids: string[] | ObjectId[]): Promise<FileDto[]> {
    const items = await this.fileModel.find({
      _id: {
        $in: ids
      }
    });

    return items.map((i) => new FileDto(i));
  }

  public async countByRefType(itemType: string): Promise<any> {
    const count = await this.fileModel.countDocuments({
      refItems: { $elemMatch: { itemType } }
    });
    return count;
  }

  public async findByRefType(itemType: string, limit: number, offset: number): Promise<any> {
    const items = await this.fileModel.find({
      refItems: { $elemMatch: { itemType } }
    }).limit(limit).skip(offset * limit);
    return items.map((item) => new FileDto(item));
  }

  public async createFromMulter(
    type: string,
    multerData: IMulterUploadedFile,
    fileUploadOptions?: IFileUploadOptions
  ): Promise<FileDto> {
    const options = { ...fileUploadOptions } || {};
    const publicDir = this.config.get('file.publicDir');
    const photoDir = this.config.get('file.photoDir');

    !existsSync(publicDir) && mkdirp.sync(publicDir);
    !existsSync(photoDir) && mkdirp.sync(photoDir);

    let absolutePath = multerData.path;
    let path = absolutePath.replace(publicDir, '');
    let { metadata = {} } = multerData;
    let { server = Storage.DiskStorage } = options;
    const {
      acl = S3ObjectCannelACL.PublicRead, thumbnailSize = { width: 250, height: 250 }, generateThumbnail = true, replaceByThumbnail = false, uploadDirectly = false
    } = options;
    const thumbnails = [];
    const s3Enabled = await this.s3StorageService.checkS3Enabled();
    if (multerData.mimetype.includes('image') && uploadDirectly) {
      const buffer = await this.imageService.replaceWithoutExif(absolutePath);
      if (generateThumbnail) {
        const thumbBuffer = await this.imageService.createThumbnail(
          absolutePath,
          thumbnailSize
        ) as Buffer;
        const thumbName = `${StringHelper.randomString(5)}_thumb${StringHelper.getExt(absolutePath)}`;
        if (s3Enabled) {
          const uploadThumb = await this.s3StorageService.upload(
            thumbName,
            S3ObjectCannelACL.PublicRead,
            thumbBuffer,
            multerData.mimetype
          );
          if (uploadThumb.Key && uploadThumb.Location) {
            thumbnails.push({
              thumbnailSize,
              path: uploadThumb.Location,
              absolutePath: uploadThumb.Key
            });
          }
        } else {
          !replaceByThumbnail && writeFileSync(join(photoDir, thumbName), thumbBuffer);
          !replaceByThumbnail && thumbnails.push({
            thumbnailSize,
            path: join(photoDir, thumbName).replace(publicDir, ''),
            absolutePath: join(photoDir, thumbName)
          });
          unlinkSync(multerData.path);
          writeFileSync(multerData.path, replaceByThumbnail && thumbBuffer ? thumbBuffer : buffer);
        }
      }
      if (s3Enabled) {
        const upload = await this.s3StorageService.upload(
          formatFileName(multerData),
          acl,
          buffer,
          multerData.mimetype
        );
        if (upload.Key && upload.Location) {
          absolutePath = upload.Key;
          path = upload.Location;
        }
        server = Storage.S3;
        metadata = {
          ...metadata,
          bucket: upload.Bucket,
          endpoint: S3Service.getEndpoint(upload)
        };
        // remove old file once upload s3 done
        existsSync(multerData.path) && unlinkSync(multerData.path);
      } else {
        server = Storage.DiskStorage;
        writeFileSync(multerData.path, buffer);
      }
    }
    // other file not image
    if (!multerData.mimetype.includes('image') && uploadDirectly) {
      // TODO file is too big - out of RAM?
      if (s3Enabled) {
        const buffer = createReadStream(absolutePath);
        const upload = await this.s3StorageService.upload(
          formatFileName(multerData),
          acl,
          buffer,
          multerData.mimetype
        );
        if (upload.Key && upload.Location) {
          absolutePath = upload.Key;
          path = upload.Location;
        }
        server = Storage.S3;
        metadata = {
          ...metadata,
          bucket: upload.Bucket,
          endpoint: S3Service.getEndpoint(upload)
        };
        // remove old file once upload s3 done
        existsSync(multerData.path) && unlinkSync(multerData.path);
      }
    }
    const data = {
      type,
      name: multerData.filename,
      description: '',
      mimeType: multerData.mimetype,
      server,
      path: path || multerData.location,
      absolutePath: absolutePath || multerData.key || multerData.path,
      acl,
      thumbnails,
      metadata,
      size: multerData.size,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: options.uploader ? options.uploader._id : null,
      updatedBy: options.uploader ? options.uploader._id : null
    };

    const file = await this.fileModel.create(data);
    // TODO - check option and process
    // eg create thumbnail, video converting, etc...
    return FileDto.fromModel(file);
  }

  public async addRef(
    fileId: ObjectId,
    ref: {
      itemId: ObjectId;
      itemType: string;
    }
  ) {
    return this.fileModel.updateOne(
      { _id: fileId },
      {
        $addToSet: {
          refItems: ref
        }
      }
    );
  }

  public async remove(fileId: string | ObjectId) {
    const file = await this.fileModel.findOne({ _id: fileId });
    if (!file) {
      return false;
    }

    await file.remove();

    const filePaths = [
      {
        absolutePath: file.absolutePath,
        path: file.path
      }
    ].concat(file.thumbnails || []);

    if (file.server === Storage.S3) {
      const del = filePaths.map((fp) => ({ Key: fp.absolutePath }));
      await this.s3StorageService.deleteObjects({ Objects: del });
      return true;
    }

    filePaths.forEach((fp) => {
      if (existsSync(fp.absolutePath)) {
        unlinkSync(fp.absolutePath);
      } else {
        const publicDir = this.config.get('file.publicDir');
        const filePublic = join(publicDir, fp.path);
        existsSync(filePublic) && unlinkSync(filePublic);
      }
    });
    // TODO - fire event
    return true;
  }

  public async deleteManyByRefIds(refIds: string[] | ObjectId[]) {
    if (!refIds.length) return;
    const files = await this.fileModel.find({
      refItems: {
        $elemMatch: {
          itemId: { $in: refIds }
        }
      }
    });
    await this.fileModel.deleteMany({ _id: files.map((f) => f._id) });
    // remove files
    await Promise.all([
      files.map((file) => {
        const filePaths = [
          {
            absolutePath: file.absolutePath,
            path: file.path
          }
        ].concat(file.thumbnails || []);
        if (file.server === Storage.S3) {
          const del = filePaths.map((fp) => ({ Key: fp.absolutePath }));
          return this.s3StorageService.deleteObjects({ Objects: del });
        }
        return filePaths.map((fp) => {
          if (existsSync(fp.absolutePath)) {
            unlinkSync(fp.absolutePath);
          } else {
            const publicDir = this.config.get('file.publicDir');
            const filePublic = join(publicDir, fp.path);
            existsSync(filePublic) && unlinkSync(filePublic);
          }
          return fp;
        });
      })
    ]);
  }

  public async removeIfNotHaveRef(fileId: string | ObjectId) {
    const file = await this.fileModel.findOne({ _id: fileId });
    if (!file) {
      return false;
    }

    if (file.refItems && !file.refItems.length) {
      return false;
    }

    await file.remove();

    if (file.server === Storage.S3) {
      const del = [{ Key: file.absolutePath }];
      await this.s3StorageService.deleteObjects({ Objects: del });
      return true;
    }

    if (existsSync(file.absolutePath)) {
      unlinkSync(file.absolutePath);
    } else {
      const publicDir = this.config.get('file.publicDir');
      const filePublic = join(publicDir, file.path);
      existsSync(filePublic) && unlinkSync(filePublic);
    }

    // TODO - fire event
    return true;
  }

  // TODO - fix here, currently we just support local server, need a better solution if scale?
  /**
   * generate mp4 video & thumbnail
   * @param fileId
   * @param options
   */
  public async queueProcessVideo(
    fileId: string | ObjectId,
    options?: {
      meta?: Record<string, any>;
      publishChannel?: string;
      keepOldFile?: boolean;
      convertFile?: boolean;
      toPath?: string;
      generateThumbnail?: boolean;
      fromFtp?: boolean;
      acl?: string;
    }
  ) {
    // add queue and convert file to mp4 and generate thumbnail
    const file = await this.fileModel.findOne({ _id: fileId });
    if (!file || file.status === 'processing') {
      return false;
    }
    await this.queueEventService.publish(
      new QueueEvent({
        channel: VIDEO_QUEUE_CHANNEL,
        eventName: 'processVideo',
        data: {
          file: new FileDto(file),
          options
        }
      })
    );
    return true;
  }

  private async _processVideo(event: QueueEvent) {
    if (event.eventName !== 'processVideo') {
      return;
    }
    const fileData = event.data.file as FileDto;
    const options = event.data.options || {};
    const {
      keepOldFile = false, convertFile = true, generateThumbnail = true, toPath = '', size = '640x360', count = 3, acl = S3ObjectCannelACL.PublicRead
    } = options;
    const publicDir = this.config.get('file.publicDir');
    const videoDir = this.config.get('file.videoDir');
    const imageDir = this.config.get('file.imageDir');

    !existsSync(publicDir) && mkdirp.sync(publicDir);
    !existsSync(videoDir) && mkdirp.sync(videoDir);
    !existsSync(imageDir) && mkdirp.sync(imageDir);

    let videoPath: string;
    let { metadata = {}, server } = fileData;
    const ftpDir = SettingService.getValueByKey(SETTING_KEYS.FTP_FOLDER_PATH) || getConfig('file').ftpFileDir;
    if (existsSync(fileData.absolutePath)) {
      videoPath = fileData.absolutePath;
    } else if (existsSync(join(publicDir, fileData.path))) {
      videoPath = join(publicDir, fileData.path);
    }
    if (!videoPath) {
      return;
    }
    try {
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'processing'
          }
        }
      );

      let newPath = videoPath.replace(publicDir, '');
      let newAbsolutePath = videoPath;
      let thumbnails = [];
      const meta = await this.videoService.getMetaData(videoPath);
      const videoMeta = meta.streams.find((s) => s.codec_type === 'video');
      const { width, height } = videoMeta || {};
      const s3Enabled = await this.s3StorageService.checkS3Enabled();
      if (convertFile) {
        const respVideo = await this.videoService.convert2Mp4(videoPath, { toPath });
        // delete old video and replace with new one
        newAbsolutePath = respVideo.toPath;
        newPath = respVideo.toPath.replace(publicDir, '');
        if (s3Enabled) {
          const video = createReadStream(respVideo.toPath);
          const result = await this.s3StorageService.upload(
            respVideo.fileName,
            acl,
            video,
            'video/mp4'
          );
          newAbsolutePath = result.Key;
          newPath = result.Location;
          server = Storage.S3;
          // eslint-disable-next-line prefer-template
          metadata = {
            ...metadata,
            bucket: result.Bucket,
            endpoint: S3Service.getEndpoint(result)
          };
          if (generateThumbnail) {
            const respThumb = await this.videoService.createThumbs(videoPath, {
              toFolder: videoDir,
              size: size || `${width}x${height}`,
              count
            });
            if (respThumb.length) {
              // eslint-disable-next-line no-restricted-syntax
              for (const name of respThumb) {
                if (existsSync(join(videoDir, name))) {
                  const file = createReadStream(join(videoDir, name));
                  // eslint-disable-next-line no-await-in-loop
                  const thumb = await this.s3StorageService.upload(
                    name,
                    S3ObjectCannelACL.PublicRead,
                    file,
                    'image/png'
                  );
                  thumbnails.push({
                    path: thumb.Location,
                    absolutePath: thumb.Key
                  });
                  unlinkSync(join(videoDir, name));
                }
              }
            }
          }
          existsSync(videoPath) && unlinkSync(videoPath);
          existsSync(respVideo.toPath) && unlinkSync(respVideo.toPath);
        } else {
          server = Storage.DiskStorage;
          if (generateThumbnail) {
            const respThumb = await this.videoService.createThumbs(videoPath, {
              toFolder: videoDir,
              size,
              count
            });
            if (respThumb.length) {
              thumbnails = respThumb.map((name) => ({
                absolutePath: join(videoDir, name),
                path: join(videoDir, name).replace(publicDir, '')
              }));
            }
          }
          if ((toPath && !keepOldFile) || (toPath && keepOldFile === 'false')) {
            existsSync(videoPath) && unlinkSync(videoPath);
          }
        }
      }
      // move to path if ftp upload
      if (!convertFile && toPath && newAbsolutePath.includes(ftpDir)) {
        const fileName = `${StringHelper.randomString(5)}-${StringHelper.getFileName(videoPath, false)}`;
        if (s3Enabled) {
          const video = createReadStream(videoPath);
          const result = await this.s3StorageService.upload(
            fileName,
            acl,
            video,
            'video/mp4'
          );
          newAbsolutePath = result.Key;
          newPath = result.Location;
          // eslint-disable-next-line prefer-template
          metadata = {
            ...metadata,
            bucket: result.Bucket,
            endpoint: S3Service.getEndpoint(result)
          };
          if (generateThumbnail) {
            const respThumb = await this.videoService.createThumbs(videoPath, {
              toFolder: videoDir,
              size: size || `${width}x${height}`,
              count
            });
            if (respThumb.length) {
              // eslint-disable-next-line no-restricted-syntax
              for (const name of respThumb) {
                if (existsSync(join(videoDir, name))) {
                  const file = createReadStream(join(videoDir, name));
                  // eslint-disable-next-line no-await-in-loop
                  const thumb = await this.s3StorageService.upload(
                    name,
                    S3ObjectCannelACL.PublicRead,
                    file,
                    'image/png'
                  );
                  thumbnails.push({
                    path: thumb.Location,
                    absolutePath: thumb.Key
                  });
                  unlinkSync(join(videoDir, name));
                }
              }
            }
          }

          existsSync(videoPath) && unlinkSync(videoPath);
        } else {
          newAbsolutePath = join(`${toPath}/`, fileName);
          newPath = newAbsolutePath.replace(publicDir, '');
          renameSync(videoPath, newAbsolutePath);
          if ((toPath && !keepOldFile) || (toPath && keepOldFile === 'false')) {
            existsSync(videoPath) && unlinkSync(videoPath);
          }
        }
      }
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'finished',
            absolutePath: newAbsolutePath,
            path: newPath,
            mimeType: 'video/mp4',
            thumbnails,
            duration: parseInt(meta.format.duration, 10),
            size: parseInt(meta.format.size, 10),
            width,
            height,
            acl,
            server,
            metadata
          }
        }
      );
    } catch (e) {
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'error'
          }
        }
      );
    } finally {
      // TODO - fire event to subscriber
      if (options.publishChannel) {
        await this.queueEventService.publish(
          new QueueEvent({
            channel: options.publishChannel,
            eventName: FILE_EVENT.VIDEO_PROCESSED,
            data: {
              meta: options.meta,
              fileId: fileData._id
            }
          })
        );
      }
    }
  }

  private async _processAudio(event: QueueEvent) {
    if (event.eventName !== 'processAudio') {
      return;
    }
    const fileData = event.data.file as FileDto;
    const options = event.data.options || {};
    try {
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'processing'
          }
        }
      );

      const publicDir = this.config.get('file.publicDir');
      // eslint-disable-next-line no-nested-ternary
      const audioPath = existsSync(fileData.absolutePath)
        ? fileData.absolutePath
        : existsSync(join(publicDir, fileData.path))
          ? join(publicDir, fileData.path)
          : null;

      if (!audioPath) {
        return;
      }

      const respAudio = await this.audioFileService.convert2Mp3(audioPath);
      // delete old audio and replace with new one
      const newAbsolutePath = respAudio.toPath;
      const newPath = respAudio.toPath.replace(publicDir, '');
      const meta = await this.videoService.getMetaData(audioPath);
      existsSync(audioPath) && unlinkSync(audioPath);
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'finished',
            absolutePath: newAbsolutePath,
            path: newPath,
            duration: parseInt(meta.format.duration, 10),
            mimeType: 'audio/mp3',
            name: fileData.name.replace(`.${fileData.mimeType.split('audio/')[1]}`, '.mp3')
          }
        }
      );
    } catch (e) {
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'error'
          }
        }
      );
    } finally {
      // TODO - fire event to subscriber
      if (options.publishChannel) {
        await this.queueEventService.publish(
          new QueueEvent({
            channel: options.publishChannel,
            eventName: FILE_EVENT.AUDIO_PROCESSED,
            data: {
              meta: options.meta,
              fileId: fileData._id
            }
          })
        );
      }
    }
  }

  /**
   * generate mp4 video & thumbnail
   * @param fileId
   * @param options
   */
  public async queueProcessAudio(
    fileId: string | ObjectId,
    options?: {
      meta?: Record<string, any>;
      publishChannel?: string;
    }
  ) {
    // add queue and convert file to mp4 and generate thumbnail
    const file = await this.fileModel.findOne({ _id: fileId });
    if (!file || file.status === 'processing') {
      return false;
    }
    await this.queueEventService.publish(
      new QueueEvent({
        channel: AUDIO_QUEUE_CHANNEL,
        eventName: 'processAudio',
        data: {
          file: new FileDto(file),
          options
        }
      })
    );
    return true;
  }

  /**
   * process to create photo thumbnails
   * @param fileId file item
   * @param options
   */
  public async queueProcessPhoto(
    fileId: string | ObjectId,
    options?: {
      meta?: Record<string, any>;
      publishChannel?: string;
      thumbnailSize: {
        width: number;
        height: number;
      };
      generateThumbnail?: boolean;
      keepOldFile?: boolean;
      toPath?: string;
      acl?: string;
    }
  ) {
    // add queue and convert file to mp4 and generate thumbnail
    const file = await this.fileModel.findOne({ _id: fileId });
    if (!file || file.status === 'processing') {
      return false;
    }
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PHOTO_QUEUE_CHANNEL,
        eventName: 'processPhoto',
        data: {
          file: new FileDto(file),
          options
        }
      })
    );
    return true;
  }

  private async _processPhoto(event: QueueEvent) {
    if (event.eventName !== 'processPhoto') {
      return;
    }
    const fileData = event.data.file as FileDto;
    let { metadata = {}, server } = fileData;
    const options = event.data.options || {};
    const {
      toPath, generateThumbnail = true, keepOldFile = true, thumbnailSize = { width: 500, height: 500 }, acl = S3ObjectCannelACL.PublicRead
    } = options;
    try {
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'processing'
          }
        }
      );

      // get thumb of the file, then convert to mp4
      const publicDir = this.config.get('file.publicDir');
      const photoDir = this.config.get('file.photoDir');
      !existsSync(publicDir) && mkdirp.sync(publicDir);
      !existsSync(photoDir) && mkdirp.sync(photoDir);

      let thumbnailAbsolutePath: string;
      let thumbnailPath: string;
      // eslint-disable-next-line no-nested-ternary
      const photoPath = existsSync(fileData.absolutePath)
        ? fileData.absolutePath
        : existsSync(join(publicDir, fileData.path))
          ? join(publicDir, fileData.path)
          : null;

      if (!photoPath) {
        return;
      }
      const meta = await this.imageService.getMetaData(photoPath);
      const fileName = `${StringHelper.randomString(5)}_${StringHelper.getFileName(photoPath, true)}.${meta.format}`;
      let newAbsolutePath = toPath ? join(`${toPath}/`, fileName) : photoPath;
      let newPath = newAbsolutePath.replace(publicDir, '');
      const buffer = await this.imageService.replaceWithoutExif(photoPath);
      const thumbName = `${StringHelper.randomString(5)}_thumb${StringHelper.getExt(photoPath)}`;
      const s3Enabled = await this.s3StorageService.checkS3Enabled();
      if (generateThumbnail) {
        const thumbBuffer = await this.imageService.createThumbnail(
          photoPath,
          thumbnailSize
        ) as Buffer;
        if (s3Enabled) {
          // upload thumb
          const upload = await this.s3StorageService.upload(
            thumbName,
            S3ObjectCannelACL.PublicRead,
            thumbBuffer,
            fileData.mimeType
          );
          thumbnailAbsolutePath = upload.Key;
          thumbnailPath = upload.Location;
        } else {
          thumbnailPath = join(photoDir, thumbName).replace(publicDir, '');
          thumbnailAbsolutePath = join(photoDir, thumbName);
          writeFileSync(join(photoDir, thumbName), thumbBuffer);
        }
      }
      // upload file to s3
      if (s3Enabled) {
        const upload = await this.s3StorageService.upload(
          fileData.name,
          acl,
          buffer,
          fileData.mimeType
        );
        if (upload.Key && upload.Location) {
          newAbsolutePath = upload.Key;
          newPath = upload.Location;
        }
        server = Storage.S3;
        metadata = {
          ...metadata,
          bucket: upload.Bucket,
          endpoint: S3Service.getEndpoint(upload)
        };
        existsSync(photoPath) && unlinkSync(photoPath);
      } else {
        writeFileSync(newAbsolutePath, buffer);
        server = Storage.DiskStorage;
      }
      // keep old file if have option
      if ((toPath && !keepOldFile) || (toPath && keepOldFile === 'false')) {
        existsSync(photoPath) && unlinkSync(photoPath);
      }
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'finished',
            width: meta.width,
            height: meta.height,
            mimeType: `image/${meta.format}`,
            absolutePath: newAbsolutePath,
            path: newPath,
            metadata,
            server,
            acl,
            thumbnails: [
              {
                path: thumbnailPath,
                absolutePath: thumbnailAbsolutePath
              }
            ]
          }
        }
      );
    } catch (e) {
      await this.fileModel.updateOne(
        { _id: fileData._id },
        {
          $set: {
            status: 'error'
          }
        }
      );
    } finally {
      // fire event to subscriber
      if (options.publishChannel) {
        await this.queueEventService.publish(
          new QueueEvent({
            channel: options.publishChannel,
            eventName: FILE_EVENT.PHOTO_PROCESSED,
            data: {
              meta: options.meta,
              fileId: fileData._id
            }
          })
        );
      }
    }
  }

  /**
   * just generate key for
   */
  private generateJwt(fileId: string | ObjectId) {
    // 3h
    const expiresIn = 60 * 60 * 3;
    return jwt.sign(
      {
        fileId
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn
      }
    );
  }

  /**
   * generate download file url with expired time check
   * @param fileId
   * @param param1
   */
  public async generateDownloadLink(fileId: string | ObjectId) {
    const newUrl = new URL('files/download', getConfig('app').baseUrl);
    newUrl.searchParams.append('key', this.generateJwt(fileId));
    return newUrl.href;
  }

  public async getStreamToDownload(key: string) {
    try {
      const decoded = jwt.verify(key, process.env.TOKEN_SECRET);
      const file = await this.fileModel.findById(decoded.fileId);
      if (!file) throw new EntityNotFoundException();
      let filePath;
      const publicDir = this.config.get('file.publicDir');
      if (existsSync(file.absolutePath)) {
        filePath = file.absolutePath;
      } else if (existsSync(join(publicDir, file.path))) {
        filePath = join(publicDir, file.path);
      } else {
        throw new EntityNotFoundException();
      }

      return {
        file,
        stream: createReadStream(filePath)
      };
    } catch (e) {
      throw new EntityNotFoundException();
    }
  }
}
