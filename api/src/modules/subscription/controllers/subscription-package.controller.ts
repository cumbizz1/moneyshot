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
import { DataResponse, PageableData } from 'src/kernel';

import { ISubscriptionPackage, SubscriptionPackageDto } from '../dtos';
import { SubscriptionPackageSearchPayload } from '../payloads';
import { SubscriptionPackageSearchService } from '../services';

@Injectable()
@Controller('package')
export class SubscriptionPackageController {
  constructor(
    private readonly subscriptionPackageSearchService: SubscriptionPackageSearchService
  ) {}

  @Get('/subscription/search')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(@Query() req: SubscriptionPackageSearchPayload): Promise<DataResponse<PageableData<ISubscriptionPackage>>> {
    const query = new SubscriptionPackageSearchPayload(req);
    const data = await this.subscriptionPackageSearchService.userSearch(query);
    return DataResponse.ok({
      total: data.total,
      data: data.data.map((p) => new SubscriptionPackageDto(p).toResponse())
    });
  }
}
