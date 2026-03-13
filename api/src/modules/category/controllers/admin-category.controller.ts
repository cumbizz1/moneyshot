import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import { UserDto } from 'src/modules/user/dtos';

import { CategoryCreatePayload } from '../payloads/category-create.payload';
import { CategorySearchRequest } from '../payloads/category-search.request';
import { CategoryUpdatePayload } from '../payloads/category-update.payload';
import { CategoryService } from '../services';

@Injectable()
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createProductCategory(
    @Body() payload: CategoryCreatePayload,
    @CurrentUser() creator: UserDto
  ): Promise<any> {
    const resp = await this.categoryService.create(payload, creator);
    return DataResponse.ok(resp);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateGallery(
    @Param('id') id: string,
    @Body() payload: CategoryUpdatePayload,
    @CurrentUser() creator: UserDto
  ): Promise<any> {
    const resp = await this.categoryService.update(id, payload, creator);
    return DataResponse.ok(resp);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchCategory(@Query() req: CategorySearchRequest): Promise<any> {
    const query = new CategorySearchRequest(req);
    const resp = await this.categoryService.search(query);
    return DataResponse.ok(resp);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async view(@Param('id') id: string): Promise<any> {
    const resp = await this.categoryService.findByIdOrAlias(id);
    return DataResponse.ok(resp);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async delete(@Param('id') id: string) {
    const details = await this.categoryService.delete(id);
    return DataResponse.ok(details);
  }
}
