const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  CCBILL_CLIENT_ACCOUNT_NUMBER: 'ccbillClientAccountNumber',
  CCBILL_SUBSCRIPTION_SUB_ACCOUNT_NUMBER: 'ccbillSubscriptionSubAccountNumber',
  CCBILL_SINGLE_SUB_ACCOUNT_NUMBER: 'ccbillSingleSubAccountNumber',
  CCBILL_FLEXFORM_ID: 'ccbillFlexformId',
  CCBILL_SUBSCRIPTION_SALT: 'ccbillSubscriptionSalt',
  CCBILL_SINGLE_SALT: 'ccbillSingleSalt',
  CCBILL_DATALINK_USERNAME: 'ccbillDatalinkUsername',
  CCBILL_DATALINK_PASSWORD: 'ccbillDatalinkPassword',
  CCBILL_ENABLE: 'ccbillEnable'
};

const settings = [
  {
    key: SETTING_KEYS.CCBILL_SUBSCRIPTION_SUB_ACCOUNT_NUMBER,
    value: '',
    name: 'Subscription sub account number',
    description: 'CCbill subscription sub account number eg: 0001',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_SUBSCRIPTION_SALT,
    value: '',
    name: 'Subscription sub account salt value',
    description: 'CCbill salt of subscription sub-account or salt of main-account',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_SINGLE_SUB_ACCOUNT_NUMBER,
    value: '',
    name: 'Single purchase sub account number',
    description: 'CCbill single purchase (non-recurring) sub account number eg: 0002',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_SINGLE_SALT,
    value: '',
    name: 'Single purchase sub account salt',
    description: 'CCbill salt of single purchase sub-account or salt of main-account',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_FLEXFORM_ID,
    value: '',
    name: 'Flexform ID',
    description: 'CCbill flexform ID',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_CLIENT_ACCOUNT_NUMBER,
    value: '',
    name: 'Client account number',
    description: 'CCbill merchant account number (eg: 987654)',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_DATALINK_USERNAME,
    value: '',
    name: 'Datalink Service username',
    description: 'Log in to CCbill admin panel -> Account Info -> Data link services suite. Use for cancel subscription if have',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_DATALINK_PASSWORD,
    value: '',
    name: 'Datalink Service password',
    description: 'Datalink requires for cancel subscription. Get info at https://admin.ccbill.com/megamenus/ccbillHome.html#AccountInfo/DataLinkServicesSuite(234). CCBill needs to review and approve request.',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.CCBILL_ENABLE,
    value: false,
    name: 'Enable / disable ccbill',
    description: 'Enable / disable ccbill',
    public: true,
    group: 'ccbill',
    editable: true,
    type: 'boolean'
  }
];

module.exports.up = async function up(next) {
  // eslint-disable-next-line no-console
  console.log('Migrate ccbill settings');

  // eslint-disable-next-line no-restricted-syntax
  for (const setting of settings) {
    // eslint-disable-next-line no-await-in-loop
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
  }
  // eslint-disable-next-line no-console
  console.log('Migrate settings done');
  next();
};

module.exports.down = function down(next) {
  next();
};
