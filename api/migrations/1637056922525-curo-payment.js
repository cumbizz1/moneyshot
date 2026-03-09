const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  CURO_API_ENDPOINT: 'curoApiEndpoint',
  CURO_MERCHANT: 'curoMerchant',
  CURO_API_KEY: 'curoApiKey',
  CURO_SITE_ID: 'curoSiteId',
  CURO_CURRENCY_CODE: 'curoCurrencyCode',
  CURO_SUCCESS_URL: 'curoSuccessUrl',
  CURO_PENDING_URL: 'curoPendingUrl',
  CURO_FAILURE_URL: 'curoFailureUrl',
  CURO_CALLBACK_URL: 'curoCallbackUrl',
  CURO_ENABLED: 'curoEnabled'
};

const settings = [
  {
    key: SETTING_KEYS.CURO_MERCHANT,
    value: '',
    name: 'Merchant',
    description: 'Your account name.',
    public: false,
    group: 'curo',
    editable: true
  },
  {
    key: SETTING_KEYS.CURO_API_KEY,
    value: '',
    name: 'Api key',
    description:
      'Api secret provided by CURO. You can find it in the merchant manager panel',
    public: false,
    group: 'curo',
    editable: true
  },
  {
    key: SETTING_KEYS.CURO_SITE_ID,
    value: '',
    name: 'Site ID',
    description:
      'Website Id provided by CURO. You can find it in the merchant manager panel',
    public: false,
    group: 'curo',
    editable: true
  },
  {
    key: SETTING_KEYS.CURO_API_ENDPOINT,
    value: 'https://secure.curopayments.net/',
    name: 'Rest API endpoint',
    description:
      'Live endpoint: https://secure.curopayments.net/ or for testing: https://secure-staging.curopayments.net/',
    public: false,
    group: 'curo',
    editable: true
  },
  {
    key: SETTING_KEYS.CURO_CURRENCY_CODE,
    value: 'USD',
    name: 'Currency',
    description: 'CURD currency',
    public: false,
    group: 'curo',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CURO_SUCCESS_URL,
    value: `https://${process.env.DOMAIN}/payment/success`,
    name: 'Success URL',
    description: 'Redirect link after paid successfully',
    public: false,
    group: 'curo',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CURO_FAILURE_URL,
    value: `https://${process.env.DOMAIN}/payment/cancel`,
    name: 'Success URL',
    description: 'Redirect link if purchased failure',
    public: false,
    group: 'curo',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CURO_PENDING_URL,
    value: `https://${process.env.DOMAIN}`,
    name: 'Success URL',
    description: 'Redirect link if payment is pending',
    public: false,
    group: 'curo',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CURO_CALLBACK_URL,
    value: `https://api.${process.env.DOMAIN}/payment/curo/callhook`,
    name: 'Success URL',
    description: `Postback URL for CURO to call our server once success. Default is https://api.${process.env.DOMAIN}/payment/curo/callhook`,
    public: false,
    group: 'curo',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CURO_ENABLED,
    value: false,
    name: 'Enable?',
    description: 'Enable to use this payment gateway',
    public: true,
    group: 'curo',
    editable: true,
    type: 'boolean'
  }
];

module.exports.up = async function up(next) {
  await settings.reduce(async (lp, setting) => {
    await lp;
    const checkKey = await DB.collection(COLLECTION.SETTING).findOne({
      key: setting.key
    });
    if (!checkKey) {
      // eslint-disable-next-line no-await-in-loop
      await DB.collection(COLLECTION.SETTING).insertOne({
        ...setting,
        type: setting.type || 'text',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      // eslint-disable-next-line no-console
      console.log(`Inserted setting: ${setting.key}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Setting: ${setting.key} exists`);
    }
    return Promise.resolve();
  }, Promise.resolve());
  next();
};

module.exports.down = function down(next) {
  next();
};
