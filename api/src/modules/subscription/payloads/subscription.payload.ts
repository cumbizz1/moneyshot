import {
  IsIn, IsNotEmpty, IsOptional, IsString
} from 'class-validator';

import { SUBSCRIPTION_TYPE } from '../constants';

export class SubscriptionCreatePayload {
  @IsString()
  @IsOptional()
  @IsIn([
    SUBSCRIPTION_TYPE.RECURRING,
    SUBSCRIPTION_TYPE.SINGLE
  ])
    subscriptionType = SUBSCRIPTION_TYPE.SINGLE;

  @IsString()
  @IsNotEmpty()
    userId: string;

  @IsString()
  @IsNotEmpty()
    expiredAt: string;

  @IsString()
  @IsOptional()
    status: string;
}
