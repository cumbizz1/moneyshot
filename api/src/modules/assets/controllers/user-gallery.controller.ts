import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { AuthService, CurrentUser } from 'src/modules/auth';
import { LoadUser } from 'src/modules/auth/guards';
import { UserDto } from 'src/modules/user/dtos';

import { GallerySearchRequest } from '../payloads';
import { GalleryService } from '../services/gallery.service';

@Injectable()
@Controller('user/assets/galleries')
export class UserGalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly authService: AuthService
  ) {}

  @Get('/search')
  @UseGuards(LoadUser)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchGallery(
    @Query() query: GallerySearchRequest,
    @Request() req: any
  ): Promise<any> {
    const search = new GallerySearchRequest(query);
    const auth = req.authUser && { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = auth && this.authService.generateJWT(auth, { expiresIn: 1 * 60 * 60 });
    const resp = await this.galleryService.userSearch(search, jwToken);
    return DataResponse.ok(resp);
  }

  @Get('/:id/view')
  @UseGuards(LoadUser)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async view(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
  ): Promise<any> {
    const resp = await this.galleryService.userDetails(id, user);
    return DataResponse.ok(resp);
  }
}
