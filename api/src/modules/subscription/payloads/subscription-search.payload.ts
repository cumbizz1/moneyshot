import { ObjectId } from 'mongodb';
import { SearchRequest } from 'src/kernel/common';

export class SubscriptionSearchRequestPayload extends SearchRequest {
  userId?: string | ObjectId;

  performerId?: string | ObjectId;

  transactionId?: string | ObjectId;

  subscriptionId?: string;

  subscriptionType?: string;

  paymentGateway?: string;

  status?: string;

  createdAt?: Date;

  expiredAt?: Date;

  fromDate?: Date;

  toDate?: Date;

  constructor(options?: Partial<SubscriptionSearchRequestPayload>) {
    super(options);

    this.userId = options?.userId;
    this.performerId = options?.performerId;
    this.transactionId = options?.transactionId;
    this.subscriptionId = options?.subscriptionId;
    this.subscriptionType = options?.subscriptionType;
    this.status = options?.status;
    this.paymentGateway = options?.paymentGateway;
    this.fromDate = options?.fromDate;
    this.createdAt = options?.createdAt;
    this.expiredAt = options?.expiredAt;
    this.toDate = options?.toDate;
  }
}
