import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export class ReactionDto {
  _id?: ObjectId;

  source?: string;

  action?: string;

  objectId?: ObjectId;

  objectType?: string;

  objectInfo?: any;

  createdBy?: string | ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  creator?: any;

  constructor(data?: Partial<ReactionDto>) {
    Object.assign(
      this,
      pick(data, [
        'source',
        'action',
        'objectId',
        'objectType',
        'objectInfo',
        'createdBy',
        'creator',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
