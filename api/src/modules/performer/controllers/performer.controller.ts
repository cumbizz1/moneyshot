import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  Param,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {
  DataResponse,
  PageableData
} from 'src/kernel';

import { PERFORMER_STATUSES } from '../constants';
import {
  IPerformerResponse,
  PerformerDto
} from '../dtos';
import {
  PerformerSearchRequest
} from '../payloads';
import { PerformerSearchService, PerformerService } from '../services';

@Injectable()
@Controller('performers')
export class PerformerController {
  constructor(
    private readonly performerService: PerformerService,
    private readonly performerSearchService: PerformerSearchService
  ) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async usearch(
    @Query() query: PerformerSearchRequest
  ): Promise<DataResponse<PageableData<IPerformerResponse>>> {
    const data = await this.performerSearchService.search(query);
    return DataResponse.ok(data);
  }

  @Get('/:username')
  @HttpCode(HttpStatus.OK)
  async getDetails(
    @Param('username') performerUsername: string
  ): Promise<DataResponse<Partial<PerformerDto>>> {
    const data = await this.performerService.findByUsername(
      performerUsername
    );

    if (!data || data.status !== PERFORMER_STATUSES.ACTIVE) {
      throw new HttpException('This account is suspended', 403);
    }

    return DataResponse.ok(data.toPublicDetailsResponse());
  }
}
