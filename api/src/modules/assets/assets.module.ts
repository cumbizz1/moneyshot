import { forwardRef, Module } from '@nestjs/common';
import { AgendaModule, MongoDBModule, QueueModule } from 'src/kernel';

import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { FileModule } from '../file/file.module';
import { MailerModule } from '../mailer/mailer.module';
import { PaymentModule } from '../payment/payment.module';
import { PerformerModule } from '../performer/performer.module';
import { ReactionModule } from '../reaction/reaction.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { UserModule } from '../user/user.module';
import { AdminPerformerGalleryController } from './controllers/admin-gallery.controller';
import { AdminPerformerPhotoController } from './controllers/admin-photo.controller';
import { AdminProductsController } from './controllers/admin-product.controller';
import { AdminPerformerVideosController } from './controllers/admin-video.controller';
import { UserGalleryController } from './controllers/user-gallery.controller';
import { UserPhotosController } from './controllers/user-photo.controller';
import { UserProductsController } from './controllers/user-product.controller';
import { UserVideosController } from './controllers/user-video.controller';
import { CommentAssetsListener, ReactionAssetsListener, StockProductListener } from './listeners';
import { assetsProviders } from './providers';
import { GalleryService } from './services/gallery.service';
import { PhotoService } from './services/photo.service';
import { PhotoSearchService } from './services/photo-search.service';
import { ProductService } from './services/product.service';
import { ProductSearchService } from './services/product-search.service';
import { VideoService } from './services/video.service';
import { VideoSearchService } from './services/video-search.service';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    AgendaModule.register(),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => MailerModule),
    forwardRef(() => FileModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => ReactionModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => SubscriptionModule),
    forwardRef(() => CategoryModule)
  ],
  providers: [
    ...assetsProviders,
    VideoService,
    VideoSearchService,
    GalleryService,
    PhotoService,
    PhotoSearchService,
    ProductService,
    ProductSearchService,
    ReactionAssetsListener,
    StockProductListener,
    CommentAssetsListener
  ],
  controllers: [
    AdminPerformerVideosController,
    AdminPerformerGalleryController,
    AdminPerformerPhotoController,
    AdminProductsController,
    UserVideosController,
    UserPhotosController,
    UserProductsController,
    UserGalleryController
  ],
  exports: [
    ...assetsProviders,
    VideoService,
    VideoSearchService,
    GalleryService,
    PhotoService,
    PhotoSearchService,
    ProductService,
    ProductSearchService
  ]
})
export class AssetsModule {}
