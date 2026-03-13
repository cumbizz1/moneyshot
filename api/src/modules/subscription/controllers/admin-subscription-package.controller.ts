import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse, PageableData } from 'src/kernel';
import { Roles } from 'src/modules/auth/decorators';
import { RoleGuard } from 'src/modules/auth/guards';

import {
  SubscriptionPackageCreatePayload,
  SubscriptionPackageSearchPayload,
  SubscriptionPackageUpdatePayload
} from '../../subscription/payloads';
import { ISubscriptionPackage, SubscriptionPackageDto } from '../dtos';
import { SubscriptionPackageSearchService, SubscriptionPackageService } from '../services';

@Controller('admin/package')
export class AdminSubscriptionPackageController {
  constructor(
    private readonly subscriptionPackageService: SubscriptionPackageService,
    private readonly subscriptionPackageSearchService: SubscriptionPackageSearchService
  ) {}

  @Post('/subscription')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: SubscriptionPackageCreatePayload
  ): Promise<DataResponse<ISubscriptionPackage>> {
    const subscriptionPackage = await this.subscriptionPackageService.create(payload);
    return DataResponse.ok(new SubscriptionPackageDto(subscriptionPackage).toResponse());
  }

  @Put('/subscription/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Body() payload: SubscriptionPackageUpdatePayload,
    @Param('id') id: string
  ): Promise<DataResponse<ISubscriptionPackage>> {
    const subscriptionPackage = await this.subscriptionPackageService.update(id, payload);
    return DataResponse.ok(new SubscriptionPackageDto(subscriptionPackage).toResponse());
  }

  @Get('/subscription/:id/view')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  async details(@Param('id') id: string): Promise<DataResponse<ISubscriptionPackage>> {
    const subscriptionPackage = await this.subscriptionPackageService.findById(id);
    return DataResponse.ok(new SubscriptionPackageDto(subscriptionPackage).toResponse());
  }

  @Delete('/subscription/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(@Param('id') id: string): Promise<DataResponse<boolean>> {
    await this.subscriptionPackageService.delete(id);
    return DataResponse.ok(true);
  }

  @Get('/subscription/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminSearch(
    @Query() req: SubscriptionPackageSearchPayload
  ): Promise<DataResponse<PageableData<ISubscriptionPackage>>> {
    const query = new SubscriptionPackageSearchPayload(req);
    const data = await this.subscriptionPackageSearchService.search(query);
    return DataResponse.ok({
      total: data.total,
      data: data.data.map((p) => new SubscriptionPackageDto(p).toResponse())
    });
  }
}
