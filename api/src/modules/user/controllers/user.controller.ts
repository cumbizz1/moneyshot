import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Put,
  Request,
  UseGuards
} from '@nestjs/common';
import { omit } from 'lodash';
import { DataResponse } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth/decorators';
import { AuthGuard } from 'src/modules/auth/guards';

import { USER_PROTECTED_UPDATE_FIELDS } from '../constants';
import { IUserResponse, UserDto } from '../dtos';
import { UserUpdatePayload } from '../payloads';
import { UserService } from '../services';

@Injectable()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async me(
    @Request() req: any
  ): Promise<DataResponse<IUserResponse>> {
    const { authUser } = req;
    const data = await this.userService.getMe(authUser.sourceId);
    return DataResponse.ok(data);
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateMe(
    @CurrentUser() currentUser: UserDto,
    @Body() payload: UserUpdatePayload
  ): Promise<DataResponse<IUserResponse>> {
    const updateData = omit(payload, USER_PROTECTED_UPDATE_FIELDS);
    await this.userService.update(currentUser._id, updateData, currentUser);

    const user = await this.userService.findById(currentUser._id);
    return DataResponse.ok(new UserDto(user).toResponse(true));
  }
}
