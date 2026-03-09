import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { OrderService, PaymentService } from 'src/modules/payment/services';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { ROLE_USER, STATUS_ACTIVE, STATUS_PENDING_EMAIL_CONFIRMATION } from 'src/modules/user/constants';
import { UserCreatePayload } from 'src/modules/user/payloads';
import { UserService } from 'src/modules/user/services';

import { AuthCreateDto } from '../dtos';
import { UserRegisterPayload } from '../payloads';
import { AuthService, VerificationService } from '../services';

@Controller('auth')
export class RegisterController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly verificationService: VerificationService,
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService
  ) {}

  @Post('users/register')
  @HttpCode(HttpStatus.OK)
  async userRegister(
    @Body() req: UserRegisterPayload
  ): Promise<DataResponse<{ message: string }>> {
    const requireEmailVerification = SettingService.getValueByKey(SETTING_KEYS.REQUIRE_EMAIL_VERIFICATION);
    const user = await this.userService.create(new UserCreatePayload(req), {
      status: requireEmailVerification ? STATUS_PENDING_EMAIL_CONFIRMATION : STATUS_ACTIVE,
      roles: ROLE_USER
    });

    await Promise.all([
      req.email && this.authService.create(new AuthCreateDto({
        source: 'user',
        sourceId: user._id,
        type: 'email',
        value: req.password,
        key: req.email
      })),
      req.username && this.authService.create(new AuthCreateDto({
        source: 'user',
        sourceId: user._id,
        type: 'username',
        value: req.password,
        key: req.username
      })),
      user.email && this.verificationService.sendVerificationEmail(user)
    ]);

    // call subscription package and get ccbill redirect url
    if (req.subscriptionPackageId) {
      const data = await this.orderService.createForSubscription({ packageId: req.subscriptionPackageId }, user as any);
      const { order, subscriptionPackage } = data;
      if (!order.totalPrice) {
        // process free subscription package, increase subscription time for user
        await this.paymentService.handlePaymentSuccess(order);
        // TODO - check config?
        return DataResponse.ok({
          message: 'We have sent an email to verify your email, please check your inbox.'
        });
      }

      const info = subscriptionPackage.type === 'single'
        ? await this.paymentService.processSinglePayment(data, req.paymentGateway || 'ccbill', req.method)
        : await this.paymentService.processSubscriptionPayment(data, req.paymentGateway || 'ccbill', req.method);

      return DataResponse.ok({
        ...info,
        message: 'We have sent an email to verify your email, please check your inbox.'
      });
    }

    return DataResponse.ok({
      message: 'We have sent an email to verify your email, please check your inbox.'
    });
  }
}
