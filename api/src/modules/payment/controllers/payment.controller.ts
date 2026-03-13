import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';

import { UserDto } from '../../user/dtos';
import {
  PurchaseProductsPayload,
  PurchaseVideoPayload,
  SubscribePayload
} from '../payloads';
import { OrderService } from '../services';
import { PaymentService } from '../services/payment.service';

@Injectable()
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService
  ) {}

  /**
   * purchase a performer video
   * @param user current login user
   * @param videoId performer video
   * @param payload
   */
  @Post('/purchase-video/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseVideo(
    @CurrentUser() user: UserDto,
    @Param('id') videoId: string,
    @Body() payload: PurchaseVideoPayload
  ): Promise<DataResponse<any>> {
    // eslint-disable-next-line no-param-reassign
    payload.videoId = videoId;
    const order = await this.orderService.createFromVOD(payload, user);
    const info = await this.paymentService.purchaseVOD(order);
    return DataResponse.ok(info);
  }

  @Post('/purchase-products')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseProducts(
    @CurrentUser() user: UserDto,
    @Body() payload: PurchaseProductsPayload
  ): Promise<DataResponse<any>> {
    // to purchase product, create new order then do the payment
    const order = await this.orderService.createFromProducts(payload, user);
    const info = await this.paymentService.purchaseProducts(order);
    return DataResponse.ok(info);
  }

  @Post('/subscribe')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async subscribe(
    @CurrentUser() user: UserDto,
    @Body() payload: SubscribePayload
  ): Promise<DataResponse<any>> {
    // to purchase product, create new order then do the payment
    const data = await this.orderService.createForSubscription(payload, user);
    const { order, subscriptionPackage } = data;
    if (!order.totalPrice) {
      // process free subscription package, increase subscription time for user
      await this.paymentService.handlePaymentSuccess(order);

      return DataResponse.ok(order);
    }
    const info = subscriptionPackage.type === 'single'
      ? await this.paymentService.processSinglePayment(data)
      : await this.paymentService.processSubscriptionPayment(data);
    return DataResponse.ok(info);
  }
}
