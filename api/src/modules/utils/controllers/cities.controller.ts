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
@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CountryService) {}

  @Get('/:countryCode/:state')
  @HttpCode(HttpStatus.OK)
  list(
    @Param('countryCode') countryCode: string,
    @Param('state') state: string
  ) {
    return DataResponse.ok(this.cityService.getCitiesInState(countryCode, state));
  }
}
