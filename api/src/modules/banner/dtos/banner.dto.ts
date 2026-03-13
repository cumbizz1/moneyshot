import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export class BannerDto {
  _id?: ObjectId;

  fileId?: ObjectId;

  title?: string;

  description?: string;

  link?: string;

  status?: string;

  position?: string;

  processing?: boolean;

  photo?: any;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(init?: Partial<BannerDto>) {
    Object.assign(
      this,
      pick(init, [
        '_id',
        'fileId',
        'title',
        'description',
        'link',
        'status',
        'position',
        'processing',
        'photo',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
