import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  Param,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { AuthService, CurrentUser } from 'src/modules/auth';
import { AuthGuard } from 'src/modules/auth/guards';
import { UserDto } from 'src/modules/user/dtos';

import { ProductSearchRequest } from '../payloads';
import { ProductService } from '../services/product.service';
import { ProductSearchService } from '../services/product-search.service';

@Injectable()
@Controller('user/assets/products')
export class UserProductsController {
  constructor(
    private readonly authService: AuthService,
    private readonly productService: ProductService,
    private readonly productSearchService: ProductSearchService
  ) {}

  @Get('/search')
  @HttpCode(HttpStatus.OK)
  async search(
    @Query() req: ProductSearchRequest
  ) {
    const query = new ProductSearchRequest(req);
    const resp = await this.productSearchService.userSearch(query);
    return DataResponse.ok(resp);
  }

  @Get('/:id')
  // @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async details(@Param('id') id: string) {
    const details = await this.productService.getDetails(id);
    // TODO - filter here
    return DataResponse.ok(details.toPublic());
  }

  @Get('/:id/download-link')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDownloadLink(
    @Param('id') id: string,
    @CurrentUser() user: UserDto
  ) {
    const downloadLink = await this.productService.generateDownloadLink(id, user._id);
    return DataResponse.ok({
      downloadLink
    });
  }

  @Get('/auth/check')
  @HttpCode(HttpStatus.OK)
  async checkAuth(
    @Request() request: any
  ) {
    if (!request.query.token) throw new HttpException('Forbiden', 403);
    const user = await this.authService.getSourceFromJWT(request.query.token as string);
    if (!user) {
      throw new HttpException('Forbiden', 403);
    }
    const valid = await this.productService.checkAuth(request, user);
    return DataResponse.ok(valid);
  }
}
