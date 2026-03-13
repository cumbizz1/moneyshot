import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { SettingModule } from 'src/modules/settings/setting.module';

import { AuthModule } from '../auth/auth.module';
import {
  CityController, CountryController, LanguageController, PhoneCodeController,
  StateController, UserAdditionalInfoController
} from './controllers';
import {
  CountryService, LanguageService, PhoneCodeService, UserAdditionalInfoService
} from './services';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5
    }),
    forwardRef(() => AuthModule),
    forwardRef(() => SettingModule)
  ],
  controllers: [
    CountryController,
    LanguageController,
    PhoneCodeController,
    UserAdditionalInfoController,
    StateController,
    CityController
  ],
  providers: [
    CountryService, LanguageService, PhoneCodeService, UserAdditionalInfoService
  ],
  exports: [CountryService, LanguageService, PhoneCodeService]
})
export class UtilsModule {}
