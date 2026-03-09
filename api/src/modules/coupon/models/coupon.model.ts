import { Document } from 'mongoose';

export class CouponModel extends Document {
  name: string;

  description: string;

  code: string;

  value: number;

  expiredDate: Date;

  timezone: string;

  status: string;

  numberOfUses: number;

  createdAt: Date;

  updatedAt: Date;
}
