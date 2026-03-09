import { forwardRef, Module } from '@nestjs/common';

import { AssetsModule } from '../assets/assets.module';
import { PerformerModule } from '../performer/performer.module';
import {
  SearchController
} from './controllers/search.controller';
import {
  SearchService
} from './services/search.service';

@Module({
  imports: [
    forwardRef(() => PerformerModule),
    forwardRef(() => AssetsModule)
  ],
  providers: [SearchService],
  controllers: [SearchController]
})
export class SearchModule {}
