import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';

import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import {
  AdminAvatarController,
  AdminUserController,
  AvatarController,
  BlockCountryController,
  UserController
} from './controllers';
import { UserConnectedListener } from './listeners/user-connected.listener';
import { blockCountryProviders, userProviders } from './providers';
import { BlockCountryService, UserSearchService, UserService } from './services';

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    forwardRef(() => SubscriptionModule)
  ],
  providers: [
    ...userProviders,
    ...blockCountryProviders,
    UserService,
    UserSearchService,
    BlockCountryService,
    UserConnectedListener
  ],
  controllers: [
    UserController,
    AvatarController,
    AdminUserController,
    AdminAvatarController,
    BlockCountryController
  ],
  exports: [...userProviders, ...blockCountryProviders, UserService, UserSearchService, BlockCountryService]
})
export class UserModule {}
