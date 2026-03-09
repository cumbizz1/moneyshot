import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from 'nestjs-config';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssetsModule } from './modules/assets/assets.module';
import { AuthModule } from './modules/auth/auth.module';
import { BannerModule } from './modules/banner/banner.module';
import { CategoryModule } from './modules/category/category.module';
import { CommentModule } from './modules/comment/comment.module';
import { ContactModule } from './modules/contact/contact.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { FileModule } from './modules/file/file.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PerformerModule } from './modules/performer/performer.module';
import { PostModule } from './modules/post/post.module';
import { ReactionModule } from './modules/reaction/reaction.module';
import { SearchModule } from './modules/search/search.module';
import { SettingModule } from './modules/settings/setting.module';
import { SocketModule } from './modules/socket/socket.module';
import { StatisticModule } from './modules/statistic/statistic.module';
import { StorageModule } from './modules/storage/storage.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { UserModule } from './modules/user/user.module';
import { UtilsModule } from './modules/utils/utils.module';

@Module({
  imports: [
    ConfigModule.resolveRootPath(__dirname).load('config/**/!(*.d).{ts,js}'),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    StorageModule.forRoot(),
    AuthModule,
    UserModule,
    PostModule,
    SettingModule,
    MailerModule,
    FileModule,
    UtilsModule,
    PerformerModule,
    AssetsModule,
    ReactionModule,
    PaymentModule,
    SubscriptionModule,
    BannerModule,
    SocketModule,
    CouponModule,
    ContactModule,
    StatisticModule,
    CategoryModule,
    CommentModule,
    SearchModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

export default AppModule;
