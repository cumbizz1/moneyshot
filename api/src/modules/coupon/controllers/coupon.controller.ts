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
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';
import { UserDto } from 'src/modules/user/dtos';

import { CouponDto, ICouponResponse } from '../dtos';
import {
  CouponCreatePayload,
  CouponSearchRequestPayload,
  CouponUpdatePayload
} from '../payloads';
import { CouponSearchService, CouponService } from '../services';

@Injectable()
@Controller('coupons')
export class AdminCouponController {
  constructor(
    private readonly couponService: CouponService,
    private readonly couponSearchService: CouponSearchService
  ) {}

  @Post('/admin')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: CouponCreatePayload
  ): Promise<DataResponse<CouponDto>> {
    const coupon = await this.couponService.create(payload);
    return DataResponse.ok(coupon);
  }

  @Put('/admin/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserDto,
    @Body() payload: CouponUpdatePayload
  ): Promise<DataResponse<CouponDto>> {
    const coupon = await this.couponService.update(id, payload);
    return DataResponse.ok(coupon);
  }

  @Delete('/admin/:id')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async delete(@Param('id') id: string): Promise<DataResponse<boolean>> {
    const deleted = await this.couponService.delete(id);
    return DataResponse.ok(deleted);
  }

  @Get('/admin/search')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async search(
    @Query() req: CouponSearchRequestPayload
  ): Promise<DataResponse<PageableData<ICouponResponse>>> {
    const query = new CouponSearchRequestPayload(req);
    const coupon = await this.couponSearchService.search(query);
    return DataResponse.ok(coupon);
  }

  @Get('admin/:id/view')
  @Roles('admin')
  @UseGuards(RoleGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(@Param('id') id: string): Promise<DataResponse<CouponDto>> {
    const coupon = await this.couponService.findByIdOrCode(id);
    return DataResponse.ok(coupon);
  }

  @Post('/:code/apply-coupon')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async checkApplyCoupon(
    @Param('code') code: string,
    @CurrentUser() currentUser: UserDto
  ): Promise<DataResponse<ICouponResponse>> {
    const canApply = await this.couponService.applyCoupon(
      code,
      currentUser._id
    );
    return DataResponse.ok(canApply.toResponse(false));
  }
}
