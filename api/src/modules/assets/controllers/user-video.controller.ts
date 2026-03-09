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
import { DataResponse, ForbiddenException } from 'src/kernel';
import { CurrentUser } from 'src/modules/auth';
import { LoadUser } from 'src/modules/auth/guards';
import { UserDto } from 'src/modules/user/dtos';

import { AuthService } from '../../auth/services';
import { VideoSearchRequest } from '../payloads';
import { VideoService } from '../services/video.service';
import { VideoSearchService } from '../services/video-search.service';

@Injectable()
@Controller('user/assets/videos')
export class UserVideosController {
  constructor(
    private readonly videoService: VideoService,
    private readonly videoSearchService: VideoSearchService,
    private readonly authService: AuthService
  ) { }

  @Get('/search')
  @UseGuards(LoadUser)
  @HttpCode(HttpStatus.OK)
  async search(
    @Query() req: VideoSearchRequest,
    @CurrentUser() user: UserDto
  ) {
    const query = new VideoSearchRequest(req);
    const resp = await this.videoSearchService.userSearch(query, user);
    return DataResponse.ok(resp);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LoadUser)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(
    @Param('id') id: string,
    @CurrentUser() user: UserDto,
    @Request() req: any
  ) {
    const auth = req.authUser && { _id: req.authUser.authId, source: req.authUser.source, sourceId: req.authUser.sourceId };
    const jwToken = req.authUser && this.authService.generateJWT(auth, { expiresIn: 1 * 60 * 60 });
    const details = await this.videoService.userGetDetails(id, user, jwToken);
    return DataResponse.ok(details);
  }

  @Get('/auth/check')
  @HttpCode(HttpStatus.OK)
  async checkAuth(
    @Request() req: any
  ) {
    if (!req.query.token) throw new ForbiddenException();
    const user = await this.authService.getSourceFromJWT(req.query.token);
    if (!user) {
      throw new ForbiddenException();
    }
    const valid = await this.videoService.checkAuth(req, user);
    return DataResponse.ok(valid);
  }
}
