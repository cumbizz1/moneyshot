import { forwardRef, Module } from '@nestjs/common';
import { QueueModule } from 'src/kernel';

import { AuthModule } from '../auth/auth.module';
import { SettingModule } from '../settings/setting.module';
import { MailerController } from './controllers/mail.controller';
import { MailerService } from './services';

@Module({
  imports: [
    QueueModule.forRoot(),
    forwardRef(() => AuthModule),
    forwardRef(() => SettingModule)
  ],
  providers: [MailerService],
  controllers: [MailerController],
  exports: [MailerService]
})
export class MailerModule {}
