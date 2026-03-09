import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { PaymentModule } from 'src/modules/payment/payment.module';

import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AdminCouponController } from './controllers/coupon.controller';
import { UpdateCouponUsesListener } from './listeners/coupon-used-listenter';
import { couponProviders } from './providers';
import { CouponSearchService, CouponService } from './services';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [...couponProviders, CouponService, CouponSearchService, UpdateCouponUsesListener],
  controllers: [AdminCouponController],
  exports: [CouponService, CouponSearchService]
})
export class CouponModule {}
