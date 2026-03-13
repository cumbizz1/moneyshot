import { forwardRef, Module } from '@nestjs/common';
import { AgendaModule, MongoDBModule } from 'src/kernel';
import { UtilsModule } from 'src/modules/utils/utils.module';

import { AssetsModule } from '../assets/assets.module';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { FileModule } from '../file/file.module';
import { MailerModule } from '../mailer/mailer.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { UserModule } from '../user/user.module';
import {
  AdminPerformerController,
  PerformerController
} from './controllers';
import {
  PerformerAssetsListener
} from './listeners';
import { performerProviders } from './providers';
import {
  PerformerSearchService,
  PerformerService
} from './services';

@Module({
  imports: [
    MongoDBModule,
    AgendaModule.register(),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => AssetsModule),
    forwardRef(() => UtilsModule),
    forwardRef(() => MailerModule),
    forwardRef(() => CategoryModule)
  ],
  providers: [
    ...performerProviders,
    PerformerService,
    PerformerSearchService,
    PerformerAssetsListener
  ],
  controllers: [
    AdminPerformerController,
    PerformerController
  ],
  exports: [
    ...performerProviders,
    PerformerService,
    PerformerSearchService
  ]
})
export class PerformerModule {}
