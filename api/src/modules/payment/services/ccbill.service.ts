import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ObjectId } from 'mongodb';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';

import { MissingConfigPaymentException } from '../exceptions';

const crypto = require('crypto');

interface CCBillSubscription {
  salt: string;
  flexformId: string;
  subAccountNumber: string;
  price: number;
  transactionId: string | ObjectId;
  initialPeriod: number;
  recurringPeriod: number;
  recurringPrice: number;
}

interface CCBillSinglePurchase {
  salt: string;
  flexformId: string;
  subAccountNumber: string;
  transactionId: string | ObjectId;
  price: number;
  initialPeriod?: number;
}
interface ICCBillCancelSubscription {
  subscriptionId: string;
  ccbillClientAccNo: string,
  ccbillDatalinkUsername: string;
  ccbillDatalinkPassword: string;
}

@Injectable()
export class CCBillService {
  constructor(
    private readonly settingService: SettingService
  ) {
  }

  public async getConfig() {
    const [enabled, flexformId, subscriptionSalt, subscriptionSubAccountNumber, singleSalt, singleSubAccountNumber, clientAccnum] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_ENABLE),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_FLEXFORM_ID),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_SUBSCRIPTION_SALT),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_SUBSCRIPTION_SUB_ACCOUNT_NUMBER),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_SINGLE_SALT),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_SINGLE_SUB_ACCOUNT_NUMBER),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_CLIENT_ACCOUNT_NUMBER)
    ]);

    return {
      enabled, flexformId, subscriptionSalt, subscriptionSubAccountNumber, singleSalt, singleSubAccountNumber, clientAccnum
    };
  }

  public async subscription(options: CCBillSubscription) {
    const {
      transactionId, salt, flexformId, subAccountNumber, initialPeriod, recurringPeriod, recurringPrice
    } = options;
    const initialPrice = options.price.toFixed(2);
    const recurringPriceFixed = recurringPrice.toFixed(2);
    const ccbillCurrency = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_CURRENCY_CODE);
    const currencyCode = ccbillCurrency || '840'; // usd as default
    if (!salt || !flexformId || !subAccountNumber || !transactionId || !initialPrice) {
      throw new MissingConfigPaymentException();
    }
    const formDigest = crypto.createHash('md5')
      .update(`${initialPrice}${initialPeriod}${recurringPriceFixed}${recurringPeriod}99${currencyCode}${salt}`).digest('hex');
    return {
      paymentUrl: `https://api.ccbill.com/wap-frontflex/flexforms/${flexformId}?transactionId=${transactionId}&initialPrice=${initialPrice}&initialPeriod=${initialPeriod}&recurringPrice=${recurringPriceFixed}&recurringPeriod=${recurringPeriod}&numRebills=99&clientSubacc=${subAccountNumber}&currencyCode=${currencyCode}&formDigest=${formDigest}`
    };
  }

  public async singlePurchase(options: CCBillSinglePurchase) {
    const {
      transactionId, salt, flexformId, subAccountNumber, initialPeriod = 30
    } = options;
    const initialPrice = options.price.toFixed(2);
    const ccbillCurrency = await this.settingService.getKeyValue(SETTING_KEYS.CCBILL_CURRENCY_CODE);
    const currencyCode = ccbillCurrency || '840'; // usd as default
    if (!salt || !flexformId || !subAccountNumber || !transactionId || !initialPrice) {
      throw new MissingConfigPaymentException();
    }
    const formDigest = crypto.createHash('md5')
      .update(`${initialPrice}${initialPeriod}${currencyCode}${salt}`)
      .digest('hex');
    return {
      paymentUrl: `https://api.ccbill.com/wap-frontflex/flexforms/${flexformId}?transactionId=${transactionId}&initialPrice=${initialPrice}&initialPeriod=${initialPeriod}&clientSubacc=${subAccountNumber}&currencyCode=${currencyCode}&formDigest=${formDigest}`
    };
  }

  public async cancelSubscription(options: ICCBillCancelSubscription) {
    const ccbillCancelUrl = 'https://datalink.ccbill.com/utils/subscriptionManagement.cgi';
    const {
      subscriptionId, ccbillClientAccNo, ccbillDatalinkUsername, ccbillDatalinkPassword
    } = options;
    const resp = await axios.get(`${ccbillCancelUrl}?subscriptionId=${subscriptionId}&username=${ccbillDatalinkUsername}&password=${ccbillDatalinkPassword}&action=cancelSubscription&clientAccnum=${ccbillClientAccNo}`);
    return resp?.data?.includes('"results"\n"1"\n');
  }
}
