import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  UseGuards
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';

import { StatisticService } from '../services';

@Injectable()
@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @Get('/admin')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async list() {
    const stats = await this.statisticService.stats();
    return DataResponse.ok(stats);
  }
}
