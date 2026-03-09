import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse, PageableData } from 'src/kernel';

import { PostDto } from '../dtos';
import { PostModel } from '../models';
import { UserSearch } from '../payloads';
import { PostSearchService, PostService } from '../services';

@Injectable()
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly postSearchService: PostSearchService
  ) {}

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(@Param('id') id: string): Promise<DataResponse<PostDto>> {
    const post = await this.postService.getPublic(id);
    return DataResponse.ok(post);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async userSearch(
    @Query() req: UserSearch
  ): Promise<DataResponse<PageableData<PostModel>>> {
    const query = new UserSearch(req);
    const post = await this.postSearchService.userSearch(query);
    return DataResponse.ok(post);
  }
}
