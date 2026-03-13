import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';

import { AuthModule } from '../auth/auth.module';
import { AdminCategoryController } from './controllers/admin-category.controller';
import { UserCategoryController } from './controllers/user-category.controller';
import { categoryProviders } from './providers';
import { CategoryService } from './services';

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule)
  ],
  providers: [
    ...categoryProviders,
    CategoryService
  ],
  controllers: [
    AdminCategoryController,
    UserCategoryController
  ],
  exports: [
    ...categoryProviders,
    CategoryService
  ]
})
export class CategoryModule {}
