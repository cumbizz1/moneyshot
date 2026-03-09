import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { Body, Delete, ObjectCannedACL } from 'aws-sdk/clients/s3';
import { StorageEngine } from 'multer';
import * as multerS3 from 'multer-s3';
import { ConfigService } from 'nestjs-config';
import { join } from 'path';
import { MulterHelper } from 'src/kernel';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';

import { S3ObjectCannelACL } from '../contants';
import {
  MulterS3Options,
  MultiUploadMulterS3Options,
  S3ServiceConfigurationOptions
} from '../interfaces';

export class S3Service {
  public static getSettings() {
    return {
      signatureVersion: 'v4',
      accessKeyId: SettingService.getValueByKey(SETTING_KEYS.AWS_S3_ACCESS_KEY_ID),
      secretAccessKey: SettingService.getValueByKey(SETTING_KEYS.AWS_S3_SECRET_ACCESS_KEY),
      region: SettingService.getValueByKey(SETTING_KEYS.AWS_S3_REGION_NAME),
      endpoint: SettingService.getValueByKey(SETTING_KEYS.AWS_S3_BUCKET_ENDPOINT),
      params: {
        Bucket: SettingService.getValueByKey(SETTING_KEYS.AWS_S3_BUCKET_NAME)
      }
    };
  }

  static listObjects(
    params: AWS.S3.ListObjectsRequest,
    options?: S3ServiceConfigurationOptions
  ) {
    const s3 = new AWS.S3({
      ...S3Service.getSettings(),
      ...(options || {})
    });
    return s3.listObjects(params).promise();
  }

  static getObject(
    params: AWS.S3.GetObjectRequest,
    options?: S3ServiceConfigurationOptions
  ) {
    const s3 = new AWS.S3({
      ...S3Service.getSettings(),
      ...(options || {})
    });
    return s3.getObject(params).promise();
  }

  static createReadStream(
    params: AWS.S3.GetObjectRequest,
    options?: S3ServiceConfigurationOptions
  ) {
    const s3 = new AWS.S3({
      ...S3Service.getSettings(),
      ...(options || {})
    });
    return s3.getObject(params).createReadStream();
  }

  static deleteObject(
    params: AWS.S3.DeleteObjectRequest,
    options?: S3ServiceConfigurationOptions
  ) {
    const s3 = new AWS.S3(options);
    return s3.deleteObject(params).promise();
  }

  static deleteObjects(
    params: AWS.S3.DeleteObjectsRequest,
    options?: S3ServiceConfigurationOptions
  ) {
    const s3 = new AWS.S3({
      ...S3Service.getSettings(),
      ...(options || {})
    });
    return s3.deleteObjects(params).promise();
  }

  static getSignedUrlPromise(
    params: any,
    options?: S3ServiceConfigurationOptions,
    operation = 'getObject'
  ): Promise<string> {
    const s3 = new AWS.S3(options);
    return s3.getSignedUrlPromise(operation, params);
  }

  static getSignedUrl(
    params: any,
    options?: S3ServiceConfigurationOptions,
    operation = 'getObject'
  ): string {
    const s3 = new AWS.S3({
      ...S3Service.getSettings(),
      ...(options || {})
    });
    const signedUrl = s3.getSignedUrl(operation, params);
    return signedUrl;
  }

  static upload(
    params: AWS.S3.PutObjectRequest,
    configurationOption?: S3ServiceConfigurationOptions,
    uploadOptions?: AWS.S3.ManagedUpload.ManagedUploadOptions
  ) {
    const s3 = new AWS.S3({
      ...S3Service.getSettings(),
      ...(configurationOption || {})
    });
    return s3.upload(params, uploadOptions).promise();
  }

  static getEndpoint(upload: AWS.S3.ManagedUpload.SendData): string {
    // eslint-disable-next-line prefer-template
    const regex = new RegExp(upload.Bucket + '[a-z0-9.-]+', 'g');
    const path = upload.Location.match(regex)[0];
    // eslint-disable-next-line prefer-template
    return path.replace(upload.Bucket + '.', '');
  }
}

@Injectable()
export class S3StorageService {
  constructor(
    private readonly config: ConfigService
  ) {}

  public checkS3Enabled() {
    if (!SettingService.getValueByKey(SETTING_KEYS.AWS_S3_ENABLE)) return false;

    const setting = S3Service.getSettings();
    if (!setting.accessKeyId || !setting.endpoint || !setting.region || !setting.secretAccessKey || !setting.params.Bucket) return false;

    return true;
  }

  public createMulterS3Storage(options: MulterS3Options): StorageEngine {
    const credential = S3Service.getSettings();
    const bucket = SettingService.getValueByKey(SETTING_KEYS.AWS_S3_BUCKET_NAME);
    const s3 = new AWS.S3(credential);
    const { acl, fileName } = options;
    const { config: { endpoint, region } } = s3;
    const folderPath = acl === S3ObjectCannelACL.PublicRead ? 'public' : 'protected';
    return multerS3({
      s3,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (req, file, cb) => cb(null, {
        ...file,
        bucket,
        endpoint,
        region,
        expires: this.config.get('s3.expires').toString()
      }),
      bucket: (req, file, cb) => cb(null, bucket),
      key: (req, file, cb) => {
        if (fileName) {
          return cb(null, join(folderPath, fileName));
        }

        return cb(null, join(folderPath, MulterHelper.formatFileName(file)));
      },
      acl: (req, file, cb) => cb(null, acl)
    });
  }

  public createMultiUploadMulterS3Storage(
    options: MultiUploadMulterS3Options
  ): StorageEngine {
    const credential = S3Service.getSettings();
    const bucket = SettingService.getValueByKey(SETTING_KEYS.AWS_S3_BUCKET_NAME);
    const s3 = new AWS.S3(credential);
    const { acls } = options;
    const { config: { endpoint, region } } = s3;
    return multerS3({
      s3,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (req, file, cb) => cb(null, {
        ...file,
        bucket,
        endpoint,
        region,
        expires: this.config.get('s3.expires').toString()
      }),
      bucket: (req, file, cb) => cb(null, bucket),
      key: (req, file, cb) => {
        const folderPath = acls[file.fieldname] === S3ObjectCannelACL.PublicRead
          ? 'public'
          : 'protected';
        return cb(null, join(folderPath, MulterHelper.formatFileName(file)));
      },
      acl: (req, file, cb) => cb(null, acls[file.fieldname] || S3ObjectCannelACL.PublicRead)
    });
  }

  upload(Key: string, ACL: ObjectCannedACL, file: Body, mimeType: string) {
    const credential = S3Service.getSettings();
    const Bucket = SettingService.getValueByKey(SETTING_KEYS.AWS_S3_BUCKET_NAME);
    // const folderPath = ACL === 'public-read' ? 'public' : 'protected';
    return S3Service.upload(
      {
        Bucket,
        Key, // join(folderPath, Key),
        ACL,
        Body: file,
        ContentType: mimeType,
        Metadata: {
          mimeType,
          endpoint: credential.endpoint,
          region: credential.region,
          bucket: Bucket,
          expires: this.config.get('s3.expires').toString()
        }
      },
      credential
    );
  }

  getObject(Key: string) {
    const credential = S3Service.getSettings();
    const Bucket = SettingService.getValueByKey(SETTING_KEYS.AWS_S3_BUCKET_NAME);
    return S3Service.getObject({ Bucket, Key }, credential);
  }

  deleteObjects(del: Delete) {
    const credential = S3Service.getSettings();
    const Bucket = SettingService.getValueByKey(SETTING_KEYS.AWS_S3_BUCKET_NAME);
    return S3Service.deleteObjects({ Bucket, Delete: del }, credential);
  }
}
