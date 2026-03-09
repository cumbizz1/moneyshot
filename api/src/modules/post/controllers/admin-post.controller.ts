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
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse, getConfig, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import {
  FileDto, FilesUploaded, FileUploaded, FileUploadInterceptor, MultiFileUploadInterceptor
} from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';

import { PostModel } from '../models';
import { AdminSearch, PostCreatePayload } from '../payloads';
import { PostSearchService, PostService } from '../services';

@Injectable()
@Controller('admin/posts')
export class AdminPostController {
  constructor(
    private readonly postService: PostService,
    private readonly postSearchService: PostSearchService
  ) {}

  @Post()
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(
    MultiFileUploadInterceptor([{
      type: 'post',
      fieldName: 'image',
      options: {
        destination: getConfig('file').imageDir,
        uploadDirectly: true
        // TODO - define rule of
      }
    }])
  )
  async create(
    @CurrentUser() currentUser: UserDto,
    @Body() payload: PostCreatePayload,
    @FilesUploaded() files: any
  ): Promise<DataResponse<PostModel>> {
    const post = await this.postService.create(payload, files?.image, currentUser);
    return DataResponse.ok(post);
  }

  @Put('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(
    MultiFileUploadInterceptor([{
      type: 'post',
      fieldName: 'image',
      options: {
        destination: getConfig('file').imageDir,
        uploadDirectly: true
        // TODO - define rule of
      }
    }])
  )
  async update(
    @CurrentUser() currentUser: UserDto,
    @Body() payload: PostCreatePayload,
    @Param('id') id: string,
    @FilesUploaded() files: any
  ): Promise<DataResponse<PostModel>> {
    const post = await this.postService.update(id, payload, files?.image, currentUser);
    return DataResponse.ok(post);
  }

  @Delete('/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(
    @CurrentUser() currentUser: UserDto,
    @Param('id') id: string
  ): Promise<DataResponse<boolean>> {
    const post = await this.postService.delete(id, currentUser);
    return DataResponse.ok(post);
  }

  @Post('images/upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    // TODO - check mime type?
    FileUploadInterceptor('post', 'image', {
      destination: getConfig('file').imageDir,
      uploadDirectly: true
      // TODO - define rule of
    })
  )
  async uploadImage(
    @FileUploaded() file: FileDto
  ): Promise<any> {
    return DataResponse.ok({
      success: true,
      ...file,
      url: file.getUrl()
    });
  }

  @Get('/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminSearch(
    @Query() req: AdminSearch
  ): Promise<DataResponse<PageableData<PostModel>>> {
    const query = new AdminSearch(req);
    const post = await this.postSearchService.adminSearch(query);
    return DataResponse.ok(post);
  }

  @Get('/:id/view')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminGetDetails(
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const post = await this.postService.adminGetDetails(id);
    return DataResponse.ok(post);
  }
}
