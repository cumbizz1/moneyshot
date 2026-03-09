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
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import { UserDto } from 'src/modules/user/dtos';

import { GalleryCreatePayload, GallerySearchRequest } from '../payloads';
import { GalleryUpdatePayload } from '../payloads/gallery-update.payload';
import { GalleryService } from '../services/gallery.service';

@Injectable()
@Controller('admin/assets/galleries')
export class AdminPerformerGalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createGallery(@Body() payload: GalleryCreatePayload, @CurrentUser() creator: UserDto): Promise<any> {
    const resp = await this.galleryService.create(payload, creator);
    return DataResponse.ok(resp);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateGallery(
    @Param('id') id: string,
    @Body() payload: GalleryUpdatePayload,
    @CurrentUser() creator: UserDto
  ): Promise<any> {
    const resp = await this.galleryService.update(id, payload, creator);
    return DataResponse.ok(resp);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchGallery(
    @Query() req: GallerySearchRequest
  ): Promise<any> {
    const query = new GallerySearchRequest(req);
    const resp = await this.galleryService.adminSearch(query);
    return DataResponse.ok(resp);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async view(
    @Param('id') id: string
  ): Promise<any> {
    const resp = await this.galleryService.adminDetails(id);
    return DataResponse.ok(resp);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async delete(@Param('id') id: string) {
    const details = await this.galleryService.delete(id);
    return DataResponse.ok(details);
  }
}
