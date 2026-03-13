import {
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {
  DataResponse, EntityNotFoundException
} from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import { UserDto } from 'src/modules/user/dtos';

import { CancelSubscriptionService } from '../services/cancel-subscription.service';
import { SubscriptionService } from '../services/subscription.service';

@Injectable()
@Controller('subscriptions/cancel')
export class CancelSubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly cancelSubscriptionService: CancelSubscriptionService
  ) {}

  @Post('/admin/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminCancel(
    @Param('id') id: string
  ): Promise<DataResponse<any>> {
    const data = await this.cancelSubscriptionService.cancelSubscription(id);
    return DataResponse.ok(data);
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @Roles('user')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async userCancel(
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<any>> {
    const subscription = await this.subscriptionService.findOne({ userId: user._id });
    if (!subscription) throw new EntityNotFoundException();
    const id = subscription.subscriptionId || subscription._id.toString();
    const data = await this.cancelSubscriptionService.cancelSubscription(id);
    return DataResponse.ok(data);
  }
}
