import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import {
  EntityNotFoundException,
  PageableData
} from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { UserService } from 'src/modules/user/services';

import {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_TYPE
} from '../constants';
import { SubscriptionDto } from '../dtos/subscription.dto';
import { SubscriptionModel } from '../models/subscription.model';
import {
  SubscriptionCreatePayload,
  SubscriptionSearchRequestPayload
} from '../payloads';
import { SUBSCRIPTION_MODEL_PROVIDER } from '../providers/subscription.provider';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(SUBSCRIPTION_MODEL_PROVIDER)
    private readonly subscriptionModel: Model<SubscriptionModel>
  ) {}

  public async findSubscriptionList(query: any) {
    return this.subscriptionModel.find(query);
  }

  public async countSubscriptions(query: any) {
    return this.subscriptionModel.countDocuments(query);
  }

  public async findOne(query: any) {
    return this.subscriptionModel.findOne(query);
  }

  public async adminCreate(
    data: SubscriptionCreatePayload
  ): Promise<SubscriptionDto> {
    const payload = { ...data } as any;
    const existSubscription = await this.subscriptionModel.findOne({
      userId: payload.userId
    });
    if (existSubscription) {
      existSubscription.expiredAt = new Date(payload.expiredAt);
      existSubscription.updatedAt = new Date();
      existSubscription.subscriptionType = payload.subscriptionType || SUBSCRIPTION_TYPE.SINGLE;
      existSubscription.status = SUBSCRIPTION_STATUS.ACTIVE;
      await existSubscription.save();
      return new SubscriptionDto(existSubscription);
    }
    payload.createdAt = new Date();
    payload.updatedAt = new Date();
    const newSubscription = await this.subscriptionModel.create(payload);
    return new SubscriptionDto(newSubscription);
  }

  public async adminSearch(
    req: SubscriptionSearchRequestPayload
  ): Promise<PageableData<SubscriptionDto>> {
    const query = {} as any;
    if (req.userId) {
      query.userId = req.userId;
    }
    if (req.subscriptionType) {
      query.subscriptionType = req.subscriptionType;
    }
    if (req.fromDate && req.toDate) {
      query.updatedAt = {
        $gt: moment(req.fromDate).toDate(),
        $lt: moment(req.toDate).toDate()
      };
    }
    let sort = {
      createdAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.subscriptionModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit || 10)
        .skip(req.offset || 0),
      this.subscriptionModel.countDocuments(query)
    ]);
    const subscriptions = data.map((d) => new SubscriptionDto(d));
    const UIds = data.map((d) => d.userId);
    const users = await this.userService.findByIds(UIds);
    subscriptions.forEach((subscription: SubscriptionDto) => {
      const user = users.find(
        (u) => u._id.toString() === subscription.userId.toString()
      );
      // eslint-disable-next-line no-param-reassign
      subscription.userInfo = new UserDto(user).toResponse() as any;
    });
    return {
      data: subscriptions,
      total
    };
  }

  public async checkSubscribed(
    userId: string | ObjectId
  ): Promise<boolean> {
    const item = await this.subscriptionModel.findOne({
      userId
    });

    if (!item) return false;

    if (['verotel', 'ccbill'].includes(item.paymentGateway) && moment(item.expiredAt).endOf('day').isAfter(new Date())) {
      return true;
    }

    return item.status === 'active' && moment(item.expiredAt).endOf('day').isAfter(new Date());
  }

  public async getCurrentSubscription(
    userId: string | ObjectId
  ) {
    return this.subscriptionModel.findOne({
      userId
    });
  }

  public async findById(id: string | ObjectId): Promise<SubscriptionModel> {
    const data = await this.subscriptionModel.findById(id);
    return data;
  }

  public async delete(id: string | ObjectId): Promise<boolean> {
    const subscription = await this.findById(id);
    if (!subscription) {
      throw new EntityNotFoundException();
    }
    await subscription.remove();
    return true;
  }

  public async findBySubscriptionId(subscriptionId: string) {
    return this.subscriptionModel.findOne({
      subscriptionId
    });
  }
}
