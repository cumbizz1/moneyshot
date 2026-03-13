import { ICountry, ILanguage, IPhoneCodes } from 'src/interfaces';

import { APIRequest, IResponse } from './api-request';

export class UtilsService extends APIRequest {
  private _countries = [] as any;

  private _bodyInfo = null as any;

  async countriesList(): Promise<IResponse<ICountry>> {
    if (this._countries.length) {
      return this._countries;
    }
    const resp = await this.get('/countries/list');
    this._countries = resp;
    return resp;
  }

  languagesList(): Promise<IResponse<ILanguage>> {
    return this.get('/languages/list');
  }

  phoneCodesList(): Promise<IResponse<IPhoneCodes>> {
    return this.get('/phone-codes/list');
  }

  async bodyInfo() {
    if (this._bodyInfo) return this._bodyInfo;

    const res = await this.get('/user-additional');
    this._bodyInfo = res;
    return res;
  }

  verifyRecaptcha(token: string) {
    return this.post('/re-captcha/verify', { token });
  }
}

export const utilsService = new UtilsService();
