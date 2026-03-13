import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule
} from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { RequestLoggerMiddleware } from 'src/kernel/logger/request-log.middleware';
import { CouponModule } from 'src/modules/coupon/coupon.module';

import { AssetsModule } from '../assets/assets.module';
import { AuthModule } from '../auth/auth.module';
import { MailerModule } from '../mailer/mailer.module';
import { PerformerModule } from '../performer/performer.module';
import { SettingModule } from '../settings/setting.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { UserModule } from '../user/user.module';
import {
  OrderController, PaymentController, PaymentWebhookController
} from './controllers';
import { OrderListener } from './listeners';
import { orderProviders, paymentProviders } from './providers';
import {
  CCBillService,
  CheckPaymentService,
  OrderService,
  PaymentService
} from './services';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => SettingModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => AssetsModule),
    forwardRef(() => CouponModule),
    forwardRef(() => MailerModule)
  ],
  providers: [
    ...paymentProviders,
    ...orderProviders,
    PaymentService,
    CCBillService,
    CheckPaymentService,
    OrderService,
    OrderListener
  ],
  controllers: [PaymentController, OrderController, PaymentWebhookController],
  exports: [
    ...paymentProviders,
    ...orderProviders,
    PaymentService,
    CCBillService,
    CheckPaymentService,
    OrderService
  ]
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('/payment/ccbill/callhook');
  }
}
