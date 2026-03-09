import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';

import { PaymentService } from '../services/payment.service';

@Injectable()
@Controller('payment')
export class PaymentWebhookController {
  constructor(
    private readonly paymentService: PaymentService
  ) { }

  @Post('/ccbill/callhook')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async ccbillCallhook(
    @Body() payload: Record<string, string>,
    @Query() req: Record<string, string>
  ): Promise<DataResponse<any>> {
    // TODO - update for ccbill whitelist here
    if (!['NewSaleSuccess', 'RenewalSuccess', 'NewSaleFailure', 'RenewalFailure'].includes(req.eventType)) {
      return DataResponse.ok(false);
    }

    let info;
    const data = {
      ...payload,
      ...req
    };
    switch (req.eventType) {
      case 'RenewalSuccess':
        info = await this.paymentService.ccbillRenewalSuccessWebhook(data);
        break;
      case 'RenewalFailure':
        info = await this.paymentService.ccbillRenewalFailWebhook(data);
        break;
      case 'NewSaleFailure':
        info = await this.paymentService.ccbillSinglePaymentFailWebhook(data);
        break;
      default:
        info = await this.paymentService.ccbillSinglePaymentSuccessWebhook(
          data
        );
        break;
    }
    return DataResponse.ok(info);
  }


  @Post('/curo/callhook')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async curoPostCallhook(
    @Body() payload: Record<string, string>,
    @Query() query: Record<string, string>
  ): Promise<DataResponse<any>> {
    const body = {
      ...query,
      ...payload
    };
    const info = await this.paymentService.curoPaymentWebhook(body);
    return DataResponse.ok(info);
  }

  @Get('/curo/callhook')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async curoGetCallhook(
    @Query() query: Record<string, string>
  ): Promise<DataResponse<any>> {
    const body = {
      ...query
    };
    const info = await this.paymentService.curoPaymentWebhook(body);
    return DataResponse.ok(info);
  }
}
