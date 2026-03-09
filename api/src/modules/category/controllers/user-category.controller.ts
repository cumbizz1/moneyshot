import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';

import { CategorySearchRequest } from '../payloads/category-search.request';
import { CategoryService } from '../services';

@Injectable()
@Controller('user/assets/categories')
export class UserCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getActiveProductCategories(
    @Query() req: CategorySearchRequest
  ): Promise<any> {
    const query = new CategorySearchRequest(req);
    req.status = 'active';
    const resp = await this.categoryService.search(query);
    return DataResponse.ok(resp);
  }
}
