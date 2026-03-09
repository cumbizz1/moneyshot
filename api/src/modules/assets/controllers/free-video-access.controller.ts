import {
  Body, Controller, Get, HttpCode, HttpStatus, Injectable, Param, Post, Put, Query, UseGuards
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import { ROLE_ADMIN } from 'src/modules/user/constants';

import { UserDto } from '../../user/dtos';
import { BulkUpdateFreeAccessPayload, UpdateFreeAccessPayload } from '../../user/payloads';
import { UserService } from '../../user/services';
import { UserSearchService } from '../../user/services/user-search.service';

@Injectable()
@Controller('admin/free-video-access')
export class FreeVideoAccessController {
  constructor(
    private readonly userService: UserService,
    private readonly userSearchService: UserSearchService
  ) {}

  @Post('/bulk-update')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLE_ADMIN)
  @UseGuards(RoleGuard)
  async bulkUpdate(
    @Body() payload: BulkUpdateFreeAccessPayload
  ) {
    await this.userService.bulkUpdateFreeVideoAccess(payload.userIds, payload.hasFreeVideoAccess);
    return DataResponse.ok({
      success: true,
      message: 'Free video access updated successfully'
    });
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLE_ADMIN)
  @UseGuards(RoleGuard)
  async update(
    @Body() payload: UpdateFreeAccessPayload,
    @Param('id') userId: string
  ) {
    const user = await this.userService.updateFreeVideoAccess(userId, payload.hasFreeVideoAccess);
    return DataResponse.ok(new UserDto(user).toResponse(true, true));
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles(ROLE_ADMIN)
  @UseGuards(RoleGuard)
  async search(@Query() query: any) {
    const { q, ...rest } = query;
    const result = await this.userSearchService.searchWithFreeVideoAccess({
      ...rest,
      q,
      role: 'user'
    });
    return DataResponse.ok(result);
  }
}
