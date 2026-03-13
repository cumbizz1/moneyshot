import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';

import { MailerModule } from '../mailer/mailer.module';
import { PaymentModule } from '../payment/payment.module';
import { SettingModule } from '../settings/setting.module';
import { UserModule } from '../user/user.module';
import {
  LoginController, PasswordController, RegisterController, VerificationController
} from './controllers';
import { AuthGuard, LoadUser, RoleGuard } from './guards';
import { authProviders } from './providers/auth.provider';
import { AuthService, VerificationService } from './services';

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => SettingModule),
    forwardRef(() => UserModule),
    forwardRef(() => MailerModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [
    ...authProviders,
    AuthService,
    VerificationService,
    AuthGuard,
    RoleGuard,
    LoadUser
  ],
  controllers: [
    RegisterController,
    LoginController,
    PasswordController,
    VerificationController
  ],
  exports: [
    ...authProviders,
    AuthService,
    VerificationService,
    AuthGuard,
    RoleGuard,
    LoadUser
  ]
})
export class AuthModule {}
