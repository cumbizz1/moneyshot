import { Injectable } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { FileService } from 'src/modules/file/services';
import { MailerService } from 'src/modules/mailer/services';
import { ORDER_PAID_SUCCESS_CHANNEL } from 'src/modules/payment/constants';
import { UserService } from 'src/modules/user/services';

import { PRODUCT_TYPE } from '../constants';
import { ProductService } from '../services';

const UPDATE_STOCK_CHANNEL = 'UPDATE_STOCK_CHANNEL';

@Injectable()
export class StockProductListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly productService: ProductService,
    private readonly mailService: MailerService,
    private readonly fileService: FileService,
    private readonly userService: UserService
  ) {
    this.queueEventService.subscribe(
      ORDER_PAID_SUCCESS_CHANNEL,
      UPDATE_STOCK_CHANNEL,
      this.handleStockProducts.bind(this)
    );
  }

  public async handleStockProducts(event: QueueEvent) {
    try {
      if (![EVENT.CREATED].includes(event.eventName)) {
        return;
      }
      const { orderDetails } = event.data;
      const productOrders = orderDetails.filter((order) => ['physical', 'digital'].includes(order.productType));
      if (!productOrders.length) {
        return;
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const orderDetail of productOrders) {
        switch (orderDetail.productType) {
          case PRODUCT_TYPE.PHYSICAL:
            // eslint-disable-next-line no-await-in-loop
            await this.productService.updateStock(orderDetail.productId, -1 * (orderDetail.quantity || 1));
            break;
          case PRODUCT_TYPE.DIGITAL:
            // eslint-disable-next-line no-await-in-loop
            await this.sendDigitalProductLink(orderDetail);
            break;
          default: break;
        }
      }
    } catch (e) {
      // TODO - log me
      // eslint-disable-next-line no-console
      console.log('error_stock_product', e);
    }
  }

  public async sendDigitalProductLink(orderDetail) {
    const product = await this.productService.getDetails(orderDetail.productId);
    if (!product || product.type !== 'digital' || !product.digitalFileId) return;
    const digitalLink = await this.fileService.generateDownloadLink(product.digitalFileId);
    const user = await this.userService.findById(orderDetail.buyerId);

    user.email && await this.mailService.send({
      subject: `Order #${orderDetail.orderNumber} - Digital file to download`,
      to: user.email,
      data: {
        userName: user?.name || user?.username || `${user?.firstName} ${user?.lastName}`,
        orderDetail,
        digitalLink,
        totalPrice: (orderDetail.totalPrice || 0).toFixed(2)
      },
      template: 'send-user-digital-product'
    });
  }
}
