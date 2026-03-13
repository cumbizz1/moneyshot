import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';

import { AuthModule } from '../auth/auth.module';
import { PaymentModule } from '../payment/payment.module';
import { SettingModule } from '../settings/setting.module';
import { UserModule } from '../user/user.module';
import { AdminSubscriptionPackageController, SubscriptionPackageController } from './controllers';
import { CancelSubscriptionController } from './controllers/cancel-subscription.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { OrderSubscriptionListener } from './listeners/order-subscription-update.listener';
import { subscriptionProviders } from './providers/subscription.provider';
import { SubscriptionPackageSearchService, SubscriptionPackageService } from './services';
import { CancelSubscriptionService } from './services/cancel-subscription.service';
import { SubscriptionService } from './services/subscription.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    }),
    QueueModule.forRoot(),
    MongoDBModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => SettingModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [
    ...subscriptionProviders,
    SubscriptionService,
    CancelSubscriptionService,
    OrderSubscriptionListener,
    SubscriptionPackageService,
    SubscriptionPackageSearchService
  ],
  controllers: [
    SubscriptionController,
    CancelSubscriptionController,
    AdminSubscriptionPackageController,
    SubscriptionPackageController
  ],
  exports: [
    ...subscriptionProviders,
    SubscriptionService,
    CancelSubscriptionService,
    SubscriptionPackageService
  ]
})
export class SubscriptionModule {}
