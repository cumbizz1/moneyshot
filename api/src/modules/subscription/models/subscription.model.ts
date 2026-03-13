import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class SubscriptionModel extends Document {
  subscriptionType?: string;

  userId: string | ObjectId;

  subscriptionId?: string;

  transactionId?: string | ObjectId;

  paymentGateway?: string;

  status?: string;

  meta?: any;

  startRecurringDate?: Date;

  nextRecurringDate?: Date;

  createdAt?: Date;

  updatedAt?: Date;

  expiredAt?: Date;
}
