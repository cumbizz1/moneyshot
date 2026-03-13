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
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { DataResponse, getConfig } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import { FilesUploaded, MultiFileUploadInterceptor } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';

import {
  BannerCreatePayload,
  BannerSearchRequest,
  BannerUpdatePayload
} from '../payloads';
import { BannerSearchService, BannerService } from '../services';

@Injectable()
@Controller('admin/site-promo')
export class AdminBannerController {
  constructor(
    private readonly bannerService: BannerService,
    private readonly bannerSearchService: BannerSearchService
  ) {}

  @Post('/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    // TODO - check and support multiple files!!!
    MultiFileUploadInterceptor([
      {
        type: 'banner',
        fieldName: 'banner',
        options: {
          destination: getConfig('file').coverDir,
          uploadDirectly: true
        }
      }
    ])
  )
  async upload(
    @FilesUploaded() files: Record<string, any>,
    @Body() payload: BannerCreatePayload,
    @CurrentUser() creator: UserDto
  ): Promise<any> {
    const resp = await this.bannerService.create(
      files.banner,
      payload,
      creator
    );
    return DataResponse.ok(resp);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async update(
    @Param('id') id: string,
    @Body() payload: BannerUpdatePayload,
    @CurrentUser() updater: UserDto
  ) {
    const details = await this.bannerService.updateInfo(id, payload, updater);
    return DataResponse.ok(details);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async delete(@Param('id') id: string) {
    const details = await this.bannerService.delete(id);
    return DataResponse.ok(details);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async search(@Query() req: BannerSearchRequest) {
    const query = new BannerSearchRequest(req);
    const list = await this.bannerSearchService.search(query);
    return DataResponse.ok(list);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async details(@Param('id') id: string) {
    const details = await this.bannerService.details(id);
    return DataResponse.ok(details);
  }
}
