import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';

import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';
import { UserModule } from '../user/user.module';
import {
  AdminPostController,
  PostController
} from './controllers';
import { postProviders } from './providers';
import { PostSearchService, PostService } from './services';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    UserModule,
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule)
  ],
  providers: [
    ...postProviders,
    PostService,
    PostSearchService
  ],
  controllers: [
    PostController,
    AdminPostController
  ],
  exports: [PostService, PostSearchService]
})
export class PostModule {}
