import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Query
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { STATUS } from 'src/kernel/constants';

import { BannerSearchRequest } from '../payloads';
import { BannerSearchService } from '../services';

@Injectable()
@Controller('site-promo')
export class BannerController {
  constructor(private readonly bannerSearchService: BannerSearchService) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async search(@Query() req: BannerSearchRequest) {
    const query = new BannerSearchRequest(req);
    query.status = STATUS.ACTIVE;
    const list = await this.bannerSearchService.search(query);
    return DataResponse.ok(list);
  }
}
