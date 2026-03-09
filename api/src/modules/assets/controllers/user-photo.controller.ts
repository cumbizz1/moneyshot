import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { DataResponse, EntityNotFoundException } from 'src/kernel';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { CurrentUser } from 'src/modules/auth';
import { AuthGuard, LoadUser } from 'src/modules/auth/guards';
import { UserDto } from 'src/modules/user/dtos';

import { AuthService } from '../../auth/services';
import { PhotoSearchRequest } from '../payloads';
import { PhotoService } from '../services/photo.service';
import { PhotoSearchService } from '../services/photo-search.service';

@Injectable()
@Controller('user/assets')
export class UserPhotosController {
  constructor(
    private readonly photoService: PhotoService,
    private readonly photoSearchService: PhotoSearchService,
    private readonly authService: AuthService
  ) {}

  @Get('/gallery/:galleryId/photos')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async list(
    @Param('galleryId') galleryId: string,
    @Query() query: PhotoSearchRequest,
    @CurrentUser() user: UserDto,
    @Request() req: any
  ) {
    if (!isObjectId(galleryId)) throw new EntityNotFoundException();
    // eslint-disable-next-line no-param-reassign
    query.targetId = galleryId;
    const auth = { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = await this.authService.generateJWT(auth, { expiresIn: 1 * 60 * 60 });
    const data = await this.photoSearchService.getModelPhotosWithGalleryCheck(query, user, jwToken);
    return DataResponse.ok(data);
  }

  @Get('/photos')
  @UseGuards(LoadUser)
  @HttpCode(HttpStatus.OK)
  async search(
    @Query() query: PhotoSearchRequest,
    @CurrentUser() user: UserDto,
    @Request() req: any
  ) {
    const search = new PhotoSearchRequest(query);
    const auth = req.authUser && { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = auth && this.authService.generateJWT(auth, { expiresIn: 1 * 60 * 60 });
    const data = await this.photoSearchService.userSearch(search, user, jwToken);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async details(
    @Param('id') id: string,
    @CurrentUser() user: UserDto,
    @Request() req: any
  ) {
    const auth = req.authUser && { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = auth && this.authService.generateJWT(auth, { expiresIn: 1 * 60 * 60 });
    const details = await this.photoService.details(id, user, jwToken);
    return DataResponse.ok(details);
  }

  @Get('/photos/auth/check')
  @HttpCode(HttpStatus.OK)
  async checkAuth(
    @Request() req: any
  ) {
    if (!req.query.token) throw new ForbiddenException();
    const user = await this.authService.getSourceFromJWT(req.query.token);
    if (!user) {
      throw new ForbiddenException();
    }
    const valid = await this.photoService.checkAuth(req, user);
    return DataResponse.ok(valid);
  }
}
