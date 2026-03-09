import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Query
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';

import { SearchPayload } from '../payloads';
import { SearchService } from '../services/search.service';

@Injectable()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/total')
  @HttpCode(HttpStatus.OK)
  async list(
    @Query() req: SearchPayload
  ) {
    const query = new SearchPayload(req);
    const stats = await this.searchService.countTotal(query);
    return DataResponse.ok(stats);
  }
}
