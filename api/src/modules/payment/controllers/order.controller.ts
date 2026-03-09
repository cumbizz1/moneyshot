import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse, PageableData } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { AuthGuard, RoleGuard } from 'src/modules/auth/guards';

import { ORDER_STATUS } from '../constants';
import { OrderDto } from '../dtos';
import { OrderSearchPayload, OrderUpdatePayload } from '../payloads';
import { OrderService } from '../services';

@Injectable()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('/details/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async ordersDetails(
    @Query() req: OrderSearchPayload
  ): Promise<DataResponse<PageableData<any>>> {
    const query = new OrderSearchPayload(req);
    const data = await this.orderService.orderDetailsSearch(query);
    return DataResponse.ok(data);
  }

  /**
   * payment history search
   * @param req
   * @param user
   */
  @Get('/search')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async orders(
    @Query() req: OrderSearchPayload
  ): Promise<DataResponse<PageableData<OrderDto>>> {
    const query = new OrderSearchPayload(req);
    const data = await this.orderService.search(query);
    return DataResponse.ok(data);
  }

  @Get('/users/details/search')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async userDetailsOrders(
    @Query() req: OrderSearchPayload,
    @CurrentUser() user: any
  ): Promise<DataResponse<PageableData<OrderDto>>> {
    const query = new OrderSearchPayload(req);
    query.buyerId = user._id;
    query.status = { $ne: ORDER_STATUS.CREATED } as any;
    const data = await this.orderService.orderDetailsSearch(query) as any;
    return DataResponse.ok(data);
  }

  @Get('/users/search')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async userOrders(
    @Query() req: OrderSearchPayload,
    @CurrentUser() user: any
  ): Promise<DataResponse<PageableData<OrderDto>>> {
    const query = new OrderSearchPayload(req);
    query.buyerId = user._id;
    query.status = { $ne: ORDER_STATUS.CREATED } as any;
    const data = await this.orderService.search(query) as any;
    return DataResponse.ok(data);
  }

  @Put('/:id/update')
  @HttpCode(HttpStatus.OK)
  @Roles('performer', 'admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() payload: OrderUpdatePayload,
    @CurrentUser() user: any
  ): Promise<DataResponse<any>> {
    const query = new OrderUpdatePayload(payload);
    const data = await this.orderService.updateDetails(id, query, user);
    return DataResponse.ok(data);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details(
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.orderService.getOrderDetails(id);
    return DataResponse.ok(data);
  }

  @Get('/details/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async details2(
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.orderService.getOrderDetails(id);
    return DataResponse.ok(data);
  }
}
