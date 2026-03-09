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
  VideoCreateFtpPayload, VideoSearchRequest, VideoUpdateFtpPayload, VideoUpdatePayload
} from '../payloads';
import { VideoCreatePayload } from '../payloads/video-create.payload';
import { VideoService } from '../services/video.service';
import { VideoSearchService } from '../services/video-search.service';

@Injectable()
@Controller('admin/assets/videos')
export class AdminPerformerVideosController {
  constructor(
    private readonly videoService: VideoService,
    private readonly videoSearchService: VideoSearchService
  ) {}

  @Post('/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    // TODO - check and support multiple files!!!
    MultiFileUploadInterceptor(
      [
        {
          type: 'video',
          fieldName: 'video',
          options: {
            destination: getConfig('file').videoProtectedDir
          }
        },
        {
          type: 'video-teaser',
          fieldName: 'teaser',
          options: {
            destination: getConfig('file').videoDir
          }
        },
        {
          type: 'video-thumbnail',
          fieldName: 'thumbnail',
          options: {
            destination: getConfig('file').imageDir
          }
        }
      ]
    )
  )
  async uploadVideo(
    @FilesUploaded() files: Record<string, any>,
    @Body() payload: VideoCreatePayload,
    @CurrentUser() user: UserDto
  ): Promise<any> {
    const resp = await this.videoService.create(
      files,
      payload,
      user
    );
    return DataResponse.ok(resp);
  }

  @Post('/ftp-create')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async uploadVideoFtp(
    @Body() payload: VideoCreateFtpPayload,
    @CurrentUser() user: UserDto
  ): Promise<any> {
    const resp = await this.videoService.ftpCreate(
      payload,
      user
    );
    return DataResponse.ok(resp);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async details(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const jwToken = req.jwToken || null;
    const details = await this.videoService.getDetails(id, jwToken);
    return DataResponse.ok(details);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async search(@Query() req: VideoSearchRequest) {
    const query = new VideoSearchRequest(req);
    const resp = await this.videoSearchService.adminSearch(query);
    return DataResponse.ok(resp);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    // TODO - check and support multiple files!!!
    MultiFileUploadInterceptor(
      [
        {
          type: 'video',
          fieldName: 'video',
          options: {
            destination: getConfig('file').videoProtectedDir
          }
        },
        {
          type: 'video-teaser',
          fieldName: 'teaser',
          options: {
            destination: getConfig('file').videoDir
          }
        },
        {
          type: 'video-thumbnail',
          fieldName: 'thumbnail',
          options: {
            destination: getConfig('file').imageDir
          }
        }
      ]
    )
  )
  async update(
    @Param('id') id: string,
    @FilesUploaded() files: Record<string, any>,
    @Body() payload: VideoUpdatePayload,
    @CurrentUser() updater: UserDto
  ) {
    const details = await this.videoService.updateInfo(id, files, payload, updater);
    return DataResponse.ok(details);
  }

  @Put('/ftp-update/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async ftpUpdate(
    @Param('id') id: string,
    @Body() payload: VideoUpdateFtpPayload,
    @CurrentUser() updater: UserDto
  ) {
    const details = await this.videoService.ftpUpdate(id, payload, updater);
    return DataResponse.ok(details);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async remove(
    @Param('id') id: string
  ) {
    const details = await this.videoService.delete(id);
    return DataResponse.ok(details);
  }
}
