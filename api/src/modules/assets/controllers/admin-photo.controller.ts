import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { DataResponse, getConfig } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import { FilesUploaded, MultiFileUploadInterceptor } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';

import {
  PhotoCreateFtpPayload, PhotoCreatePayload, PhotoSearchRequest, PhotoUpdatePayload
} from '../payloads';
import { PhotoService } from '../services/photo.service';
import { PhotoSearchService } from '../services/photo-search.service';

@Injectable()
@Controller('admin/assets/photos')
export class AdminPerformerPhotoController {
  constructor(
    private readonly photoService: PhotoService,
    private readonly photoSearchService: PhotoSearchService
  ) {}

  @Post('/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    // TODO - check and support multiple files!!!
    MultiFileUploadInterceptor([
      {
        type: 'gallery-photo',
        fieldName: 'photo',
        options: {
          destination: getConfig('file').photoProtectedDir
        }
      }
    ])
  )
  async upload(
    @FilesUploaded() files: Record<string, any>,
    @Body() payload: PhotoCreatePayload,
    @CurrentUser() creator: UserDto
  ): Promise<any> {
    const resp = await this.photoService.create(
      files.photo,
      payload,
      creator
    );
    return DataResponse.ok(resp);
  }

  @Post('/ftp-create')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async uploadVideoFtp(
    @Body() payload: PhotoCreateFtpPayload,
    @CurrentUser() user: UserDto
  ): Promise<any> {
    const resp = await this.photoService.ftpCreate(
      payload,
      user
    );
    return DataResponse.ok(resp);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async update(
    @Param('id') id: string,
    @Body() payload: PhotoUpdatePayload,
    @CurrentUser() updater: UserDto
  ) {
    const details = await this.photoService.updateInfo(id, payload, updater);
    return DataResponse.ok(details);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async delete(@Param('id') id: string) {
    const details = await this.photoService.delete(id);
    return DataResponse.ok(details);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async search(
    @Query() query: PhotoSearchRequest,
    @Request() req: any
  ) {
    const search = new PhotoSearchRequest(query);
    const { jwToken } = req;
    const details = await this.photoSearchService.adminSearch(search, jwToken);
    return DataResponse.ok(details);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async details(
    @Param('id') id: string,
    @CurrentUser() user: UserDto,
    @Request() req: any
  ) {
    const details = await this.photoService.details(id, user, req.jwToken);
    return DataResponse.ok(details);
  }

  @Post('/set-cover/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async setCoverGallery(
    @Param('id') id: string
  ) {
    const data = await this.photoService.setCoverGallery(id);
    return DataResponse.ok(data);
  }
}
