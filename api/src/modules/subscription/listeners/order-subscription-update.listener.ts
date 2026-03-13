import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT, STATUS } from 'src/kernel/constants';
import {
  ORDER_PAID_SUCCESS_CHANNEL,
  PAYMENT_TYPE
} from 'src/modules/payment/constants';
import { OrderDetailsModel, OrderModel, PaymentTransactionModel } from 'src/modules/payment/models';

import { SubscriptionDto } from '../dtos/subscription.dto';
import { SubscriptionModel } from '../models/subscription.model';
import { SUBSCRIPTION_MODEL_PROVIDER } from '../providers/subscription.provider';

const UPDATE_SUBSCRIPTION_CHANNEL = 'UPDATE_SUBSCRIPTION_CHANNEL';

@Injectable()
export class OrderSubscriptionListener {
  constructor(
    @Inject(SUBSCRIPTION_MODEL_PROVIDER)
    private readonly subscriptionModel: Model<SubscriptionModel>,
    private readonly queueEventService: QueueEventService
  ) {
    this.queueEventService.subscribe(
      ORDER_PAID_SUCCESS_CHANNEL,
      UPDATE_SUBSCRIPTION_CHANNEL,
      this.handleListenSubscription.bind(this)
    );
  }

  public async handleListenSubscription(
    event: QueueEvent
    // transactionPayload: any, eventType?: string
  ): Promise<any> {
    try {
      if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
        return;
      }
      const { transaction, order, orderDetails } = event.data;
      if (![PAYMENT_TYPE.SUBSCRIPTION_PACKAGE].includes(order.type) && ![PAYMENT_TYPE.SUBSCRIPTION_PACKAGE].includes(orderDetails.type)) {
        return;
      }
      // not support for other gateway
      if (transaction.paymentGateway !== 'ccbill') {
        return;
      }
      await this.handleCCBillSubscription(order, orderDetails, transaction);
    } catch (e) {
      // TODO - log me
      // eslint-disable-next-line no-console
      console.log('err_listen_subscription', e);
    }
  }

  private async handleCCBillSubscription(order: OrderModel, orderDetails: OrderDetailsModel, transaction: PaymentTransactionModel) {
    const existSubscription = await this.subscriptionModel.findOne({
      userId: order.buyerId
    });
    // load the model details and update info
    let expiredAt;
    if (transaction?.paymentResponseInfo?.nextRenewalDate) {
      expiredAt = moment(transaction?.paymentResponseInfo?.nextRenewalDate).toDate();
    } else if (transaction?.paymentResponseInfo?.initialPeriod) {
      expiredAt = moment().add(transaction?.paymentResponseInfo?.initialPeriod, 'days').toDate();
    } else if (orderDetails[0]?.extraInfo?.initalPeriod) {
      // check extra field in model details if have
      expiredAt = moment().add(orderDetails[0]?.extraInfo?.initalPeriod, 'days').toDate();
    } else if (orderDetails[0]?.extraInfo?.recurringPeriod) {
      // check extra field in model details if have
      expiredAt = moment().add(orderDetails[0]?.extraInfo?.recurringPeriod, 'days').toDate();
    } else {
      return false;
    }
    const subscriptionType = orderDetails[0]?.extraInfo?.recurring ? 'recurring' : 'single';
    const subscriptionId = transaction?.paymentResponseInfo?.subscriptionId || transaction?.paymentResponseInfo?.subscription_id || null;
    const paymentResponseInfo = transaction?.paymentResponseInfo || {} as any;
    const { paymentGateway } = transaction;
    const startRecurringDate = paymentResponseInfo.renewalDate || paymentResponseInfo.timestamp;
    const nextRecurringDate = paymentResponseInfo.nextRenewalDate;
    if (existSubscription) {
      existSubscription.expiredAt = new Date(expiredAt);
      existSubscription.updatedAt = new Date();
      existSubscription.subscriptionType = subscriptionType;
      existSubscription.transactionId = transaction._id;
      existSubscription.meta = paymentResponseInfo;
      existSubscription.subscriptionId = subscriptionId;
      existSubscription.paymentGateway = paymentGateway;
      existSubscription.startRecurringDate = startRecurringDate
        ? new Date(startRecurringDate)
        : new Date();
      existSubscription.nextRecurringDate = nextRecurringDate
        ? new Date(nextRecurringDate)
        : new Date(expiredAt);
      existSubscription.status = STATUS.ACTIVE;
      await existSubscription.save();
      return new SubscriptionDto(existSubscription);
    }
    const newSubscription = await this.subscriptionModel.create({
      performerId: order.sellerId,
      userId: order.buyerId,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiredAt: new Date(expiredAt),
      subscriptionType,
      subscriptionId,
      meta: paymentResponseInfo,
      paymentGateway,
      startRecurringDate: startRecurringDate
        ? new Date(startRecurringDate)
        : new Date(),
      nextRecurringDate: nextRecurringDate
        ? new Date(nextRecurringDate)
        : new Date(expiredAt),
      transactionId: transaction._id,
      status: STATUS.ACTIVE
    });

    return new SubscriptionDto(newSubscription);
  }
}
