/* eslint-disable camelcase */
import { Document } from 'mongoose';

export class SubscriptionPackageModel extends Document {
  name?: string;

  description?: string;

  ordering?: number;

  price?: number;

  tokens?: number;

  isActive?: boolean;

  initialPeriod: number;

  recurringPrice: number;

  recurringPeriod: number;

  type: string;

  updatedAt?: Date;

  createdAt?: Date;
}
