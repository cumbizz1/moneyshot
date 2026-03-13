import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common';
import { DataResponse, StringHelper } from 'src/kernel';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import {
  STATUS_INACTIVE, STATUS_PENDING_EMAIL_CONFIRMATION
} from 'src/modules/user/constants';
import { UserService } from 'src/modules/user/services';

import {
  AccountInactiveException, AccountNotFoundxception, EmailNotVerifiedException, PasswordIncorrectException
} from '../exceptions';
import { LoginPayload } from '../payloads';
import { AuthService } from '../services';

@Controller('auth')
export class LoginController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() req: LoginPayload
  ): Promise<DataResponse<{ token: string }>> {
    const query = StringHelper.isEmail(req.username) ? { email: req.username.toLowerCase() } : { username: req.username.toLowerCase() };
    const user = await this.userService.findOne(query);
    if (!user) {
      throw new AccountNotFoundxception();
    }
    const requireEmailVerification = SettingService.getValueByKey(SETTING_KEYS.REQUIRE_EMAIL_VERIFICATION);
    if ((requireEmailVerification && user.status === STATUS_PENDING_EMAIL_CONFIRMATION)
      || (requireEmailVerification && !user.verifiedEmail)) {
      throw new EmailNotVerifiedException();
    }
    if (user.status === STATUS_INACTIVE) {
      throw new AccountInactiveException();
    }
    const auth = await this.authService.findBySource({
      source: 'user',
      sourceId: user._id
    });
    if (!auth) {
      throw new AccountNotFoundxception();
    }
    if (!this.authService.verifyPassword(req.password, auth)) {
      throw new PasswordIncorrectException();
    }
    return DataResponse.ok({
      token: req.remember ? this.authService.generateJWT(auth, { expiresIn: 60 * 60 * 24 * 30 }) : this.authService.generateJWT(auth, { expiresIn: 60 * 60 * 24 * 1 })
    });
  }
}
