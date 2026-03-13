import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export interface ICouponResponse {
  _id?: ObjectId;
  name?: string;
  description?: string;
  code?: string;
  value?: number;
  numberOfUses?: number;
  expiredDate?: Date;
  timezone?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export class CouponDto {
  _id?: ObjectId;

  name?: string;

  description?: string;

  code?: string;

  value?: number;

  numberOfUses?: number;

  expiredDate?: Date;

  timezone?: string;

  status?: string;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(data?: Partial<CouponDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'name',
        'description',
        'code',
        'value',
        'expiredDate',
        'timezone',
        'status',
        'numberOfUses',
        'createdAt',
        'updatedAt'
      ])
    );
  }

  toResponse(includePrivateInfo = false) {
    const publicInfo = {
      _id: this._id,
      code: this.code,
      value: this.value
    };
    const privateInfo = {
      name: this.name,
      expiredDate: this.expiredDate,
      timezone: this.timezone,
      status: this.status,
      numberOfUses: this.numberOfUses,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt
    };
    if (!includePrivateInfo) {
      return publicInfo;
    }
    return {
      ...publicInfo,
      ...privateInfo
    };
  }
}
