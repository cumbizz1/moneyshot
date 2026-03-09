import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { MailerModule } from 'src/modules/mailer/mailer.module';

import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';
import { UserModule } from '../user/user.module';
import { AdminSettingController } from './controllers/admin-setting.controller';
import { MenuController } from './controllers/menu.controller';
import { SettingController } from './controllers/setting.controller';
import { SettingFileUploadController } from './controllers/setting-file-upload.controller';
import { menuProviders, settingProviders } from './providers';
import { MenuService, SettingService } from './services';

@Module({
  imports: [
    QueueModule.forRoot(),
    MongoDBModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    forwardRef(() => MailerModule)
  ],
  providers: [
    ...settingProviders,
    ...menuProviders,
    SettingService,
    MenuService
  ],
  controllers: [
    SettingController,
    SettingFileUploadController,
    AdminSettingController,
    MenuController
  ],
  exports: [...settingProviders, ...menuProviders, SettingService, MenuService]
})
export class SettingModule {
  constructor(private settingService: SettingService) {
    this.settingService.syncCache();
  }
}
