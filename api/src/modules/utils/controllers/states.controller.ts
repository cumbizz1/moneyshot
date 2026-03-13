import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';

import { CountryService } from '../services/country.service';

@Injectable()
@Controller('states')
export class StateController {
  constructor(private readonly stateService: CountryService) {}

  @Get(':countryCode')
  @HttpCode(HttpStatus.OK)
  list(
    @Param('countryCode') code: string
  ) {
    return DataResponse.ok(this.stateService.getStatesByCountry(code));
  }
}
