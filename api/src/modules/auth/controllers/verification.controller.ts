import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { UserService } from 'src/modules/user/services';

import { VerificationService } from '../services';

@Controller('auth')
export class VerificationController {
  constructor(
    private readonly userService: UserService,
    private readonly verificationService: VerificationService,
    private readonly settingService: SettingService
  ) {}

  @Post('email-verification/resend')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(
    @Body('email') email: string
  ) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new HttpException('No account was found, please try again', 404);
    await this.verificationService.sendVerificationEmail(user);
    return DataResponse.ok({ success: true });
  }

  @Get('email-verification')
  public async verifyEmail(
    @Res() res: any,
    @Query('token') token: string
  ) {
    if (!token) {
      return res.render('404.html');
    }
    await this.verificationService.verifyEmail(token);

    const redirectUrl = await this.settingService.getKeyValue(SETTING_KEYS.LINK_VERIFICATION_SUCCESS_URL);
    if (redirectUrl || process.env.EMAIL_VERIFIED_SUCCESS_URL) {
      return res.redirect(redirectUrl || process.env.EMAIL_VERIFIED_SUCCESS_URL);
    }

    return res.redirect(`${process.env.BASE_URL}/auth/login`);
  }
}
