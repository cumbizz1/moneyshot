import { HttpException, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  EntityNotFoundException
} from 'src/kernel';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { MissingConfigPaymentException } from 'src/modules/payment/exceptions';
import { CCBillService } from 'src/modules/payment/services';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { SettingService } from 'src/modules/settings/services';

import {
  SUBSCRIPTION_STATUS
} from '../constants';
import { SubscriptionModel } from '../models/subscription.model';
import { SUBSCRIPTION_MODEL_PROVIDER } from '../providers/subscription.provider';

@Injectable()
export class CancelSubscriptionService {
  constructor(
    @Inject(SUBSCRIPTION_MODEL_PROVIDER)
    private readonly subscriptionModel: Model<SubscriptionModel>,
    private readonly settingService: SettingService,
    private readonly ccbillService: CCBillService
  ) {
  }

  public async cancelSubscription(id: string) {
    const query = { } as any;
    if (isObjectId(id)) query._id = id;
    else query.subscriptionId = id;
    const subscription = await this.subscriptionModel.findOne(query);
    if (!subscription) throw new EntityNotFoundException();

    if (!subscription.transactionId || subscription.subscriptionType !== 'recurring') {
      subscription.status = SUBSCRIPTION_STATUS.DEACTIVATED;
      subscription.updatedAt = new Date();
      await subscription.save();
      return { success: true };
    }

    if (subscription.paymentGateway !== 'ccbill') {
      throw new HttpException('Only support to cancel subscription CCbill', 422);
    }

    const [ccbillClientAccNo, ccbillDatalinkUsername, ccbillDatalinkPassword] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_CLIENT_ACCOUNT_NUMBER),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_DATALINK_USERNAME),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_DATALINK_PASSWORD)
    ]);
    if (!ccbillClientAccNo || !ccbillDatalinkUsername || !ccbillDatalinkPassword) {
      throw new MissingConfigPaymentException();
    }

    const status = await this.ccbillService.cancelSubscription({
      subscriptionId: subscription.subscriptionId,
      ccbillClientAccNo,
      ccbillDatalinkUsername,
      ccbillDatalinkPassword
    });
    if (!status) throw new HttpException(`Cannot cancel subscription ${subscription.subscriptionId}`, 403);
    subscription.status = SUBSCRIPTION_STATUS.DEACTIVATED;
    subscription.updatedAt = new Date();
    await subscription.save();
    return { success: true };
  }
}
