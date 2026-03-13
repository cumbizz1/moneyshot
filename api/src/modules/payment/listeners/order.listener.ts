import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { MailerService } from 'src/modules/mailer';
import {
  DELIVERY_STATUS,
  ORDER_PAID_SUCCESS_CHANNEL,
  PAYMENT_TYPE,
  TRANSACTION_SUCCESS_CHANNEL
} from 'src/modules/payment/constants';
import { SettingService } from 'src/modules/settings/services';
import { UserService } from 'src/modules/user/services';

import { ORDER_STATUS, PAYMENT_STATUS } from '../constants';
import { OrderDto, PaymentDto } from '../dtos';
import { OrderDetailsModel, OrderModel } from '../models';
import { ORDER_DETAIL_MODEL_PROVIDER, ORDER_MODEL_PROVIDER } from '../providers';

const ORDER_CHANNEL = 'ORDER_CHANNEL';

@Injectable()
export class OrderListener {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly mailService: MailerService,
    @Inject(ORDER_MODEL_PROVIDER)
    private readonly orderModel: Model<OrderModel>,
    @Inject(ORDER_DETAIL_MODEL_PROVIDER)
    private readonly orderDetailsModel: Model<OrderDetailsModel>,
    private readonly queueEventService: QueueEventService
  ) {
    this.queueEventService.subscribe(
      TRANSACTION_SUCCESS_CHANNEL,
      ORDER_CHANNEL,
      this.handleListen.bind(this)
    );
  }

  private async handlePurchaseEmail(order: OrderModel, orderDetails: OrderDetailsModel[]): Promise<any> {
    const adminEmail = SettingService.getByKey('adminEmail').value || process.env.ADMIN_EMAIL;
    const user = await this.userService.findById(order.buyerId);
    if (!user) {
      return false;
    }
    const data = {
      user,
      order,
      orderDetails
    };
    // mail to admin
    if (adminEmail) {
      await this.mailService.send({
        subject: 'New payment success',
        to: adminEmail,
        data,
        template: 'admin-payment-success'
      });
    }
    // mail to user
    if (user.email) {
      await this.mailService.send({
        subject: 'New payment success',
        to: user.email,
        data,
        template: 'user-payment-success'
      });
    }

    return true;
  }

  private async handleSubscriptionEmail(order: OrderModel, orderDetails: OrderDetailsModel[]): Promise<any> {
    // TODO - define new emails templates
    const adminEmail = SettingService.getByKey('adminEmail').value || process.env.ADMIN_EMAIL;
    const user = await this.userService.findById(order.buyerId);
    if (!user) {
      return false;
    }
    const data = {
      user,
      order,
      orderDetails
    };
    // mail to admin
    if (adminEmail) {
      await this.mailService.send({
        subject: 'New subscription',
        to: adminEmail,
        data,
        template: 'admin-new-subscription'
      });
    }
    // mail to user
    if (user.email) {
      await this.mailService.send({
        subject: 'New payment success',
        to: user.email,
        data,
        template: 'user-payment-success'
      });
    }

    return true;
  }

  public async handleListen(
    event: QueueEvent
  ): Promise<OrderDto> {
    if (event.eventName !== EVENT.CREATED) {
      return;
    }
    const transaction = event.data as PaymentDto;
    if (transaction?.status !== PAYMENT_STATUS.SUCCESS) {
      return;
    }

    const order = await this.orderModel.findById(transaction.orderId);
    if (!order) {
      // TODO - log me
      return;
    }
    order.status = ORDER_STATUS.PAID;
    order.deliveryStatus = DELIVERY_STATUS.DELIVERED;
    await order.save();
    // update for sub order payment status
    const orderDetails = await this.orderDetailsModel.find({ orderId: order._id });
    // eslint-disable-next-line no-restricted-syntax
    for (const detail of orderDetails) {
      detail.status = ORDER_STATUS.PAID;
      if (detail.productType !== 'physical') {
        detail.deliveryStatus = DELIVERY_STATUS.DELIVERED;
      }
      // eslint-disable-next-line no-await-in-loop
      await detail.save();
    }

    await this.queueEventService.publish(
      new QueueEvent({
        channel: ORDER_PAID_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: {
          order,
          orderDetails,
          transaction
        }
      })
    );

    // TODO - send digital download link to user
    switch (order.type) {
      case PAYMENT_TYPE.PRODUCT:
        await this.handlePurchaseEmail(order, orderDetails);
        break;
      case PAYMENT_TYPE.SALE_VIDEO:
        await this.handlePurchaseEmail(order, orderDetails);
        break;
      case PAYMENT_TYPE.SALE_GALLERY:
        await this.handlePurchaseEmail(order, orderDetails);
        break;
      case PAYMENT_TYPE.SUBSCRIPTION_PACKAGE:
        await this.handleSubscriptionEmail(order, orderDetails);
        break;
      default: break;
    }
  }
}
