import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { UserService } from 'src/modules/user/services';
import { PaymentTransactionModel } from '../models';

@Injectable()
export class CuroService {
  constructor(
    private readonly settingService: SettingService,
    private readonly userService: UserService,
    private httpService: HttpService
  ) { }

  protected async getRequestHeader() {
    const [CURO_MERCHANT, CURO_API_KEY] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.CURO_MERCHANT),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_API_KEY)
    ]);

    return {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(
        `${CURO_MERCHANT}:${CURO_API_KEY}`
      ).toString('base64')}`
    };
  }

  public async recurringPayment(
    transaction: PaymentTransactionModel,
    orderDetails,
    dayPeriod = 3,
    method = 'creditcard'
  ) {
    // https://www.curopayments.com/docs/api/?rest_Subscriptions
    const [
      CURO_API_ENDPOINT,
      CURO_SITE_ID,
      CURO_CURRENCY_CODE,
      CURO_SUCCESS_URL,
      CURO_PENDING_URL,
      CURO_FAILURE_URL,
      CURO_CALLBACK_URL
    ] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.CURO_API_ENDPOINT),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_SITE_ID),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_CURRENCY_CODE),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_SUCCESS_URL),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_PENDING_URL),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_FAILURE_URL),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_CALLBACK_URL)
    ]);
    const userId = (orderDetails[0] as any).buyerId;
    const user = await this.userService.findById(userId);

    // https://www.curopayments.com/docs/api/?rest_Cartitems
    const description = orderDetails.map((o) => o.name).join('; ');
    const periodType = 'day';
    const postData = {
      // payment method check list here https://www.curopayments.com/docs/api/?rest_Methods
      pt: method,
      period: dayPeriod,
      period_type: periodType, // day, week, month, year
      period_price: transaction.totalPrice * 100, // The price per period in cents
      site_id: CURO_SITE_ID,
      currency_id: CURO_CURRENCY_CODE,
      reference: transaction._id,
      description,
      url_success: CURO_SUCCESS_URL,
      url_pending: CURO_PENDING_URL,
      url_failure: CURO_FAILURE_URL,
      url_callback: CURO_CALLBACK_URL,
      consumer: {
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.email,
        country_id: user.country
      },
      cartitems: orderDetails.map((o) => ({
        quantity: o.quantity,
        sku: o.productId,
        name: o.name,
        price: o.totalPrice * 100,
        type: 1,
        vat: 0
      }))
    };

    /**
     * {
      "payment": {
            "action": "redirect",
            "external": true,
            "url": "http:\/\/www.example.com\/pending.html?status=pending&transaction=T1234567890&code=701&reference=Reference+1",
            "transaction_id": "T1234567890",
            "testmode": 1
        },
        "success": true,
    } */
    const headers = await this.getRequestHeader();
    const resp = await lastValueFrom(this.httpService
      .post(
        new URL('/rest/v1/curo/subscription/register', CURO_API_ENDPOINT).href,
        postData,
        {
          headers
        }
      ));
    const data = resp.data.data || resp.data;
    return {
      paymentUrl: data.subscription?.url || data.payment.url
    };
  }

  public async singlePayment(
    transaction: PaymentTransactionModel,
    orderDetails,
    method = 'creditcard'
  ) {
    const [
      CURO_API_ENDPOINT,
      CURO_SITE_ID,
      CURO_CURRENCY_CODE,
      CURO_SUCCESS_URL,
      CURO_PENDING_URL,
      CURO_FAILURE_URL,
      CURO_CALLBACK_URL
    ] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.CURO_API_ENDPOINT),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_SITE_ID),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_CURRENCY_CODE),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_SUCCESS_URL),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_PENDING_URL),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_FAILURE_URL),
      this.settingService.getKeyValue(SETTING_KEYS.CURO_CALLBACK_URL)
    ]);
    const userId = (orderDetails[0] as any).buyerId;
    const user = await this.userService.findById(userId);

    const total = orderDetails.reduce((lv, o) => lv + o.totalPrice * 100, 0);

    // https://www.curopayments.com/docs/api/?rest_Cartitems
    const description = orderDetails.map((o) => o.name).join('; ');
    const postData = {
      site_id: CURO_SITE_ID,
      currency_id: CURO_CURRENCY_CODE,
      reference: transaction._id,
      description,
      url_success: CURO_SUCCESS_URL,
      url_pending: CURO_PENDING_URL,
      url_failure: CURO_FAILURE_URL,
      url_callback: CURO_CALLBACK_URL,
      consumer: {
        firstname: user.firstName,
        lastname: user.lastName,
        email: user.email,
        country_id: user.country
      },
      cartitems: orderDetails.map((o) => ({
        quantity: o.quantity,
        sku: o.productId,
        name: o.name,
        price: o.totalPrice * 100,
        type: 1,
        vat: 0
      })),
      ip: '192.168.1.1',
      amount: total
    };

    /**
     * {
      "payment": {
            "action": "redirect",
            "external": true,
            "url": "http:\/\/www.example.com\/pending.html?status=pending&transaction=T1234567890&code=701&reference=Reference+1",
            "transaction_id": "T1234567890",
            "testmode": 1
        },
        "success": true,
    } */
    const headers = await this.getRequestHeader();
    const resp = await lastValueFrom(this.httpService
      .post(
        new URL(`/rest/v1/curo/payment/${method}`, CURO_API_ENDPOINT).href,
        postData,
        {
          headers
        }
      ));
    const data = resp.data.data || resp.data;
    return {
      paymentUrl: data?.url || data?.payment?.url || null
    };
  }

  public async cancelSubscription(subscriptionId) {
    const [CURO_API_ENDPOINT] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.CURO_API_ENDPOINT)
    ]);
    const headers = await this.getRequestHeader();
    await lastValueFrom(this.httpService
      .post(
        new URL('/rest/v1/curo/subscription/suspend', CURO_API_ENDPOINT).href,
        {
          subscription_id: subscriptionId
        },
        {
          headers
        }
      ));
    return true;
  }

  public async detailsTransaction(transactionId) {
    const [
      CURO_API_ENDPOINT
    ] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.CURO_API_ENDPOINT)
    ]);

    const headers = await this.getRequestHeader();

    const resp = await lastValueFrom(this.httpService
      .get(
        new URL(`/rest/v1/curo/transaction/${transactionId}`, CURO_API_ENDPOINT).href,
        {
          headers
        }
      ));

    return resp.data.data || resp.data;
  }

  /**
   *
   * @param response {
    "transaction": {
      "merchant_id": "1",
      "site_id": "123",
      "site_name": "Test Site",
      "code": "200",
      "country_id": "NL",
      "currency_id": "EUR",
      "reference": "O1234567890",
      "parent_transaction_id": "master",
      "payment_type_id": "18",
      "payment_type": "iDeal",
      "type": null,
      "description": "Order 1",
      "payouts": [],
      "id": "T1234567890"
      ....
    },
    "success": true
  }
   */
  public isTransactionSuccess(code) {
    // check code here https://www.curopayments.com/docs/api/?rest_Transaction#TransactionStatusCodes
    const codeCheck = parseInt(code, 10);
    return (
      codeCheck >= 200 && codeCheck < 300
    );
  }
}
