import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Res,
  UseGuards
} from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Response } from 'express';
import * as moment from 'moment';
import { DataResponse } from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { UserService } from 'src/modules/user/services';

import { CurrentUser, Roles } from '../decorators';
import { AuthUpdateDto } from '../dtos';
import { AccountNotFoundxception } from '../exceptions';
import { AuthGuard, RoleGuard } from '../guards';
import { ForgotPayload, PasswordChangePayload, PasswordUserChangePayload } from '../payloads';
import { AuthService } from '../services';

@Controller('auth')
export class PasswordController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) { }

  @Put('users/me/password')
  @UseGuards(AuthGuard)
  public async updatePassword(
    @CurrentUser() user: UserDto,
    @Body() payload: PasswordChangePayload
  ): Promise<DataResponse<boolean>> {
    await this.authService.update(
      new AuthUpdateDto({
        source: payload.source || 'user',
        sourceId: user._id,
        type: payload.type || 'email',
        value: payload.password
      })
    );
    return DataResponse.ok(true);
  }

  @Put('users/password')
  @Roles('admin')
  @UseGuards(RoleGuard)
  public async updateUserPassword(
    @Body() payload: PasswordUserChangePayload
  ): Promise<DataResponse<boolean>> {
    await this.authService.update(
      new AuthUpdateDto({
        source: payload.source || 'user',
        sourceId: payload.userId as any,
        value: payload.password
      })
    );
    return DataResponse.ok(true);
  }

  @Post('users/forgot')
  @HttpCode(HttpStatus.OK)
  public async forgotPassword(
    @Body() req: ForgotPayload
  ): Promise<DataResponse<{ success: boolean }>> {
    // TODO - should query from auth service only
    // need to fix
    const user = await this.userService.findByEmail(req.email);
    if (!user) {
      // dont show error, avoid email fetching

      throw new AccountNotFoundxception();
    }
    const auth = await this.authService.findBySource({
      source: 'user',
      sourceId: user._id,
      type: 'email'
    });
    if (!auth) {
      throw new AccountNotFoundxception();
    }

    // TODO - should query from auth?
    user.email && await this.authService.forgot(auth, {
      _id: user._id,
      email: user.email
    });

    return DataResponse.ok({
      success: true
    });
  }

  @Get('password-change')
  public async renderUpdatePassword(
    @Res() res: Response,
    @Query('token') token: string
  ) {
    if (!token) {
      return res.render('404.html');
    }

    const forgot = await this.authService.getForgot(token);
    if (!forgot) {
      return res.render('404.html');
    }
    if (moment(forgot.createdAt).isAfter(moment().add(1, 'day'))) {
      await forgot.remove();
      return res.render('404.html');
    }

    return res.render('password-change.html');
  }

  @Post('password-change')
  public async updatePasswordForm(
    @Res() res: Response,
    @Query('token') token: string,
    @Body('password') password: string
  ) {
    if (!token || !password || password.length < 6) {
      return res.render('404.html');
    }

    const forgot = await this.authService.getForgot(token);
    if (!forgot) {
      return res.render('404.html');
    }
    // TODO - check forgot table
    await this.authService.update(
      new AuthUpdateDto({
        source: forgot.source,
        sourceId: forgot.sourceId,
        value: password
      })
    );
    await forgot.remove();
    // TODO - should remove other forgot link?
    return res.render('password-change.html', {
      done: true
    });
  }
}
