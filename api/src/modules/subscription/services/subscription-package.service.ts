import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { merge } from 'lodash';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { EntityNotFoundException } from 'src/kernel';

import { SubscriptionPackageDto } from '../../subscription/dtos';
import { SUBSCRIPTION_PACKAGE_MODEL_PROVIDER } from '../../subscription/providers';
import { SubscriptionPackageModel } from '../models';
import {
  SubscriptionPackageCreatePayload,
  SubscriptionPackageUpdatePayload
} from '../payloads';

@Injectable()
export class SubscriptionPackageService {
  constructor(
    @Inject(SUBSCRIPTION_PACKAGE_MODEL_PROVIDER)
    private readonly subscriptionPackageModel: Model<SubscriptionPackageModel>
  ) {}

  public async find(params: any): Promise<SubscriptionPackageModel[]> {
    return this.subscriptionPackageModel.find(params);
  }

  public async findById(id: string | ObjectId): Promise<SubscriptionPackageModel> {
    const query = { _id: id };
    return this.subscriptionPackageModel.findOne(query);
  }

  public async create(
    payload: SubscriptionPackageCreatePayload
  ): Promise<SubscriptionPackageModel> {
    const data = {
      ...payload
    };

    const subscriptionPackage = await this.subscriptionPackageModel.create(data);
    return subscriptionPackage;
  }

  public async update(
    id: string | ObjectId,
    payload: SubscriptionPackageUpdatePayload
  ): Promise<SubscriptionPackageModel> {
    const subscriptionPackage = await this.findById(id);
    if (!subscriptionPackage) {
      throw new NotFoundException();
    }
    // TODO - check logical here
    merge(subscriptionPackage, payload);
    subscriptionPackage.set('updatedAt', new Date());
    await subscriptionPackage.save();
    return subscriptionPackage;
  }

  public async delete(id: string | ObjectId): Promise<boolean> {
    const subscriptionPackage = await this.findById(id);
    if (!subscriptionPackage) {
      throw new NotFoundException();
    }

    await subscriptionPackage.remove();
    return true;
  }

  public async getPublic(id: string): Promise<SubscriptionPackageDto> {
    const subscriptionPackage = await this.subscriptionPackageModel.findById(id);
    if (!subscriptionPackage) {
      throw new EntityNotFoundException();
    }

    const dto = new SubscriptionPackageDto(subscriptionPackage);
    return dto;
  }
}
