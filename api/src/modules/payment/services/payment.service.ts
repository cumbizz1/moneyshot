import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import {
  QueueEvent,
  QueueEventService
} from 'src/kernel';
import { EVENT } from 'src/kernel/constants';

import { SubscriptionService } from '../../subscription/services/subscription.service';
import {
  DELIVERY_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  TRANSACTION_SUCCESS_CHANNEL
} from '../constants';
import { OrderModel, PaymentTransactionModel } from '../models';
import { PAYMENT_TRANSACTION_MODEL_PROVIDER } from '../providers';
import { CCBillService } from './ccbill.service';
import { OrderService } from './order.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_TRANSACTION_MODEL_PROVIDER)
    private readonly paymentTransactionModel: Model<PaymentTransactionModel>,
    private readonly ccbillService: CCBillService,
    private readonly queueEventService: QueueEventService,
    private readonly subscriptionService: SubscriptionService,
    private readonly orderService: OrderService
  ) { }

  public async findById(id: string | ObjectId) {
    return this.paymentTransactionModel.findById(id);
  }

  public async purchaseProducts(order: OrderModel, paymentGateway = 'ccbill') {
    const {
      enabled,
      flexformId,
      singleSubAccountNumber,
      singleSalt
    } = await this.ccbillService.getConfig();
    if (!enabled) throw new HttpException('CCBill is not enabled', 422);

    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: PAYMENT_TYPE.PRODUCT,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.PENDING,
      products: []
    });
    return this.ccbillService.singlePurchase({
      salt: singleSalt,
      flexformId,
      subAccountNumber: singleSubAccountNumber,
      price: order.totalPrice,
      transactionId: transaction._id
    });
  }

  public async purchaseVOD(order: OrderModel, paymentGateway = 'ccbill') {
    const {
      enabled,
      flexformId,
      singleSubAccountNumber,
      singleSalt
    } = await this.ccbillService.getConfig();
    if (!enabled) throw new HttpException('CCBill is not enabled', 422);

    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: PAYMENT_TYPE.SALE_VIDEO,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.PENDING,
      products: []
    });
    return this.ccbillService.singlePurchase({
      salt: singleSalt,
      flexformId,
      subAccountNumber: singleSubAccountNumber,
      price: order.totalPrice,
      transactionId: transaction._id
    });
  }

  public async processSinglePayment(data, paymentGateway = 'ccbill') {
    const {
      enabled,
      flexformId,
      singleSubAccountNumber,
      singleSalt
    } = await this.ccbillService.getConfig();
    if (!enabled) throw new HttpException('CCBill is not enabled', 422);
    const { order, subscriptionPackage } = data;
    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: PAYMENT_TYPE.SUBSCRIPTION_PACKAGE,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.PENDING,
      products: []
    });
    return this.ccbillService.singlePurchase({
      salt: singleSalt,
      flexformId,
      subAccountNumber: singleSubAccountNumber,
      price: order.totalPrice,
      transactionId: transaction._id,
      initialPeriod: subscriptionPackage ? subscriptionPackage.initialPeriod : 0
    });
  }

  public async processSubscriptionPayment(data, paymentGateway = 'ccbill') {
    const {
      enabled,
      flexformId,
      subscriptionSubAccountNumber,
      subscriptionSalt
    } = await this.ccbillService.getConfig();
    if (!enabled) throw new HttpException('CCBill is not enabled', 422);
    const { order, subscriptionPackage } = data;
    const transaction = await this.paymentTransactionModel.create({
      paymentGateway,
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: PAYMENT_TYPE.SUBSCRIPTION_PACKAGE,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.PENDING, // pending
      products: []
    });
    return this.ccbillService.subscription({
      salt: subscriptionSalt,
      flexformId,
      subAccountNumber: subscriptionSubAccountNumber,
      price: order.totalPrice,
      transactionId: transaction._id,
      recurringPeriod: subscriptionPackage.recurringPeriod,
      recurringPrice: subscriptionPackage.recurringPrice,
      initialPeriod: subscriptionPackage.initialPeriod
    });
  }

  public async ccbillSinglePaymentSuccessWebhook(payload: Record<string, any>) {
    const transactionId = payload['X-transactionId'] || payload.transactionId;
    if (!transactionId) {
      throw new BadRequestException();
    }
    const checkForHexRegExp = /^[0-9a-fA-F]{24}$/;
    if (!checkForHexRegExp.test(transactionId)) {
      return { ok: false };
    }
    const transaction = await this.paymentTransactionModel.findById(
      transactionId
    );
    if (!transaction || transaction.status !== PAYMENT_STATUS.PENDING) {
      return { ok: false };
    }
    transaction.status = PAYMENT_STATUS.SUCCESS;
    transaction.paymentResponseInfo = payload;
    transaction.updatedAt = new Date();
    await transaction.save();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: TRANSACTION_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: transaction
      })
    );
    return { ok: true };
  }

  public async ccbillSinglePaymentFailWebhook(payload: Record<string, any>) {
    const transactionId = payload['X-transactionId'] || payload.transactionId;
    if (!transactionId) {
      throw new BadRequestException();
    }
    const checkForHexRegExp = /^[0-9a-fA-F]{24}$/;
    if (!checkForHexRegExp.test(transactionId)) {
      return { ok: false };
    }
    const transaction = await this.paymentTransactionModel.findById(
      transactionId
    );
    if (!transaction) {
      return { ok: false };
    }
    transaction.status = PAYMENT_STATUS.FAILED;
    transaction.paymentResponseInfo = payload;
    transaction.updatedAt = new Date();
    await transaction.save();
    await this.orderService.findOrdersAndUpdateFailStatus(transaction.orderId);
    return { ok: true };
  }

  public async ccbillRenewalSuccessWebhook(payload: any) {
    const subscriptionId = payload.subscriptionId || payload.subscription_id;
    if (!subscriptionId) {
      throw new BadRequestException();
    }

    const subscription = await this.subscriptionService.findBySubscriptionId(subscriptionId);
    if (!subscription) {
      // TODO - should check in case admin delete subscription??
      // TODO - log me
      return { ok: false };
    }

    // create user order and transaction for this order
    const price = payload.billedAmount || payload.accountingAmount || payload.accountingRecurringPrice;
    const { userId } = subscription;
    const order = await this.orderService.createForSubscriptionRenewal({
      userId,
      price,
      type: PAYMENT_TYPE.SUBSCRIPTION_PACKAGE
    });
    await this.handlePaymentSuccess(order, payload);

    return { ok: true };
  }

  public async ccbillRenewalFailWebhook(payload: any) {
    const subscriptionId = payload.subscriptionId || payload.subscription_id;
    if (!subscriptionId) {
      throw new BadRequestException();
    }

    const subscription = await this.subscriptionService.findBySubscriptionId(subscriptionId);
    if (!subscription) {
      // TODO - should check in case admin delete subscription??
      // TODO - log me
      return { ok: false };
    }

    // create user order and transaction for this order
    const price = payload.billedAmount || payload.accountingAmount;
    const { userId } = subscription;
    const order = await this.orderService.createForSubscriptionRenewal({
      userId,
      price,
      type: PAYMENT_TYPE.SUBSCRIPTION_PACKAGE
    }, 'user', ORDER_STATUS.FAILED, DELIVERY_STATUS.FAILED);

    await this.handlePaymentSuccess(order, payload);

    return { ok: true };
  }

  public async handlePaymentSuccess(order, paymentResponseInfo?: any) {
    const transaction = await this.paymentTransactionModel.create({
      paymentGateway: 'ccbill',
      orderId: order._id,
      source: order.buyerSource,
      sourceId: order.buyerId,
      type: order.type,
      totalPrice: order.totalPrice,
      status: PAYMENT_STATUS.SUCCESS,
      paymentResponseInfo,
      products: []
    });

    await this.queueEventService.publish(
      new QueueEvent({
        channel: TRANSACTION_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: transaction
      })
    );
  }
}
