import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export class PhotoDto {
  _id?: ObjectId;

  target?: string;

  targetId?: ObjectId;

  targetInfo?: any;

  fileId?: ObjectId;

  photo?: any;

  type?: string;

  title?: string;

  description?: string;

  status?: string;

  processing?: boolean;

  gallery?: any;

  isCover?: boolean;

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(init?: Partial<PhotoDto>) {
    Object.assign(
      this,
      pick(init, [
        '_id',
        'target',
        'targetId',
        'targetInfo',
        'fileId',
        'photo',
        'type',
        'title',
        'description',
        'status',
        'processing',
        'isCover',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
