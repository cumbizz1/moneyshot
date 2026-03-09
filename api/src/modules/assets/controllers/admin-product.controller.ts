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
import { DataResponse, getConfig } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import {
  FileDto, FilesUploaded, FileUploaded, FileUploadInterceptor, MultiFileUploadInterceptor
} from 'src/modules/file';
import { S3ObjectCannelACL } from 'src/modules/storage/contants';
import { UserDto } from 'src/modules/user/dtos';

import { ProductCreatePayload, ProductSearchRequest } from '../payloads';
import { ProductService } from '../services/product.service';
import { ProductSearchService } from '../services/product-search.service';

@Injectable()
@Controller('admin/assets/products')
export class AdminProductsController {
  constructor(
    private readonly productService: ProductService,
    private readonly productSearchService: ProductSearchService
  ) {}

  @Post('/image')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor(
      'product-image',
      'image',
      {
        destination: getConfig('file').imageDir
      }
    )
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadImage(
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.productService.validatePhoto(file);
    return DataResponse.ok({
      success: true,
      ...file.toResponse(),
      url: file.getUrl()
    });
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    // TODO - check and support multiple files!!!
    MultiFileUploadInterceptor([
      {
        type: 'product-digital',
        fieldName: 'digitalFile',
        options: {
          destination: getConfig('file').digitalProductDir,
          uploadDirectly: true,
          acl: S3ObjectCannelACL.AuthenticatedRead
        }
      }
    ])
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @FilesUploaded() files: Record<string, any>,
    @Body() payload: ProductCreatePayload,
    @CurrentUser() creator: UserDto
  ): Promise<any> {
    const resp = await this.productService.create(
      payload,
      files.digitalFile,
      creator
    );
    return DataResponse.ok(resp);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    // TODO - check and support multiple files!!!
    MultiFileUploadInterceptor([
      {
        type: 'product-digital',
        fieldName: 'digitalFile',
        options: {
          destination: getConfig('file').digitalProductDir,
          uploadDirectly: true,
          acl: S3ObjectCannelACL.AuthenticatedRead
        }
      }
    ])
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @FilesUploaded() files: Record<string, any>,
    @Body() payload: ProductCreatePayload,
    @CurrentUser() updater: UserDto
  ): Promise<any> {
    const resp = await this.productService.update(
      id,
      payload,
      files.digitalFile,
      updater
    );
    return DataResponse.ok(resp);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async delete(@Param('id') id: string): Promise<any> {
    const resp = await this.productService.delete(id);
    return DataResponse.ok(resp);
  }

  @Get('/:id/view')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async details(@Param('id') id: string): Promise<any> {
    const resp = await this.productService.getDetails(id);
    return DataResponse.ok(resp);
  }

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async search(@Query() req: ProductSearchRequest): Promise<any> {
    const query = new ProductSearchRequest(req);
    const resp = await this.productSearchService.adminSearch(query);
    return DataResponse.ok(resp);
  }
}
