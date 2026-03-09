import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';

import { COUNTRIES } from '../constants';

const states = require('countrycitystatejson');
const cities = require('countrycitystatejson');

@Injectable()
export class CountryService {
  constructor(private httpService: HttpService) {}

  private countryList;

  public getList() {
    if (this.countryList) {
      return this.countryList;
    }

    this.countryList = COUNTRIES.map((c) => ({
      name: c.name,
      code: c.code,
      flag: c.flag
    }));
    return this.countryList;
  }

  public async findCountryByIP(ip: string): Promise<AxiosResponse<any>> {
    try {
      const response = await lastValueFrom(this.httpService
        .get(`http://ip-api.com/json/${ip}`));
      return response.data;
    } catch (e) {
      // const error = e.then(resp => resp);;
      return null;
    }
  }

  public getStatesByCountry(code: string) {
    const data = states.getStatesByShort(code);
    return data;
  }

  public getCitiesInState(countryCode: string, state: string) {
    const data = cities.getCities(countryCode, state);
    return data;
  }
}
