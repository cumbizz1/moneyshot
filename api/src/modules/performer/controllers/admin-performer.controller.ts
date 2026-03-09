import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse, getConfig, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import { FileDto, FileUploaded, FileUploadInterceptor } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';

import { IPerformerResponse, PerformerDto } from '../dtos';
import {
  PerformerCreatePayload,
  PerformerSearchRequest,
  PerformerUpdatePayload
} from '../payloads';
import { PerformerSearchService, PerformerService } from '../services';

@Injectable()
@Controller('admin/performers')
export class AdminPerformerController {
  constructor(
    private readonly performerService: PerformerService,
    private readonly performerSearchService: PerformerSearchService
  ) {}

  @Get('/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: PerformerSearchRequest
  ): Promise<DataResponse<PageableData<IPerformerResponse>>> {
    const query = new PerformerSearchRequest(req);
    const data = await this.performerSearchService.adminSearch(query);
    return DataResponse.ok(data);
  }

  @Post()
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @CurrentUser() currentUser: UserDto,
    @Body() payload: PerformerCreatePayload
  ): Promise<DataResponse<PerformerDto>> {
    const performer = await this.performerService.create(payload, currentUser);

    return DataResponse.ok(performer);
  }

  @Put('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  async updateUser(
    @Body() payload: PerformerUpdatePayload,
    @Param('id') performerId: string
  ): Promise<DataResponse<any>> {
    const data = await this.performerService.adminUpdate(performerId, payload);
    return DataResponse.ok(data);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async getDetails(
    @Param('id') performerId: string
  ): Promise<DataResponse<IPerformerResponse>> {
    const performer = await this.performerService.getDetails(performerId);
    // TODO - check roles or other to response info
    const data = performer.toResponse(true, true);
    return DataResponse.ok(data);
  }

  @Post('/avatar/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('avatar', 'avatar', {
      destination: getConfig('file').avatarDir,
      uploadDirectly: true,
      generateThumbnail: true,
      replaceByThumbnail: true,
      thumbnailSize: getConfig('image').avatar
    })
  )
  async uploadPerformerAvatar(@FileUploaded() file: FileDto): Promise<any> {
    // TODO - define url for perfomer id if have?
    return DataResponse.ok({
      ...file,
      url: file.getUrl()
    });
  }

  @Post('/cover/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('cover', 'cover', {
      destination: getConfig('file').coverDir,
      uploadDirectly: true
    })
  )
  async uploadPerformerCover(@FileUploaded() file: FileDto): Promise<any> {
    // TODO - define url for perfomer id if have?
    return DataResponse.ok({
      ...file,
      url: file.getUrl()
    });
  }
}
