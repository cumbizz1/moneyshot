import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';

import { AssetsModule } from '../assets/assets.module';
import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';
import { PerformerModule } from '../performer/performer.module';
import { UserModule } from '../user/user.module';
import { ReactionController } from './controllers/reaction.controller';
import { DeleteAssetsListener } from './listeners/handle-delete-assets.listener';
import { reactionProviders } from './providers/reaction.provider';
import { ReactionService } from './services/reaction.service';

@Module({
  imports: [
    QueueModule.forRoot(),
    MongoDBModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => AssetsModule),
    forwardRef(() => FileModule)
  ],
  providers: [...reactionProviders, ReactionService, DeleteAssetsListener],
  controllers: [ReactionController],
  exports: [ReactionService]
})
export class ReactionModule {}
