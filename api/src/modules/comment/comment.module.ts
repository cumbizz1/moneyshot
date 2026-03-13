import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';
import { ReactionModule } from 'src/modules/reaction/reaction.module';

import { AssetsModule } from '../assets/assets.module';
import { AuthModule } from '../auth/auth.module';
import { PerformerModule } from '../performer/performer.module';
import { UserModule } from '../user/user.module';
import { CommentController } from './controllers/comment.controller';
import { ReactionCommentListener, ReplyCommentListener } from './listeners';
import { commentProviders } from './providers/comment.provider';
import { CommentService } from './services/comment.service';

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => AssetsModule),
    forwardRef(() => ReactionModule)
  ],
  providers: [
    ...commentProviders,
    CommentService,
    ReplyCommentListener,
    ReactionCommentListener
  ],
  controllers: [
    CommentController
  ],
  exports: []
})
export class CommentModule {}
