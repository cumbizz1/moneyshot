import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';

import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';
import { UserModule } from '../user/user.module';
import { AdminBannerController } from './controllers/admin-banner.controller';
import { BannerController } from './controllers/banner.controller';
import { bannerProviders } from './providers';
import { BannerSearchService, BannerService } from './services';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    UserModule,
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule)
  ],
  providers: [...bannerProviders, BannerService, BannerSearchService],
  controllers: [AdminBannerController, BannerController],
  exports: [BannerService, BannerSearchService]
})
export class BannerModule {}
