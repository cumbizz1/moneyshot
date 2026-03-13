/* eslint-disable camelcase */
import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export interface ISubscriptionPackage {
  _id: ObjectId;
  name: string;
  description: string;
  ordering: number;
  price: number;
  tokens: number;
  isActive: boolean;
  initialPeriod: number;
  updatedAt: Date;
  createdAt: Date;
  recurringPrice: number;
  recurringPeriod: number;
  type: string;
}

export class SubscriptionPackageDto {
  _id: ObjectId;

  name: string;

  description: string;

  ordering: number;

  price: number;

  tokens: number;

  isActive: boolean;

  initialPeriod: number;

  updatedAt: Date;

  createdAt: Date;

  recurringPrice: number;

  recurringPeriod: number;

  type: string;

  constructor(data: Partial<ISubscriptionPackage>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'name',
        'description',
        'ordering',
        'price',
        'tokens',
        'isActive',
        'initialPeriod',
        'updatedAt',
        'createdAt',
        'recurringPrice',
        'recurringPeriod',
        'type'
      ])
    );
  }

  toResponse() {
    return {
      _id: this._id,
      name: this.name,
      description: this.description,
      ordering: this.ordering,
      price: this.price,
      tokens: this.tokens,
      isActive: this.isActive,
      initialPeriod: this.initialPeriod,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt,
      recurringPrice: this.recurringPrice,
      recurringPeriod: this.recurringPeriod,
      type: this.type
    };
  }
}
