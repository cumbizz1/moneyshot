const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  CURRENCY: 'currency',
  CURRENCY_SYMBOL: 'currencySymbol',
  CCBILL_CURRENCY_CODE: 'ccbillCurrencyCode'
};

const settings = [
  {
    key: SETTING_KEYS.CURRENCY,
    value: 'USD',
    name: 'Currency',
    description: 'The currency will be use in the system',
    public: true,
    group: 'currency',
    editable: true
  },
  {
    key: SETTING_KEYS.CURRENCY_SYMBOL,
    value: '$',
    name: 'Currency symbol',
    description: 'The symbol will be shown in the FE',
    public: true,
    group: 'currency',
    editable: true
  },
  {
    key: SETTING_KEYS.CCBILL_CURRENCY_CODE,
    value: '840',
    name: 'Ccbill currency code',
    description:
      'Currency code will be used in the system. Details may check here https://ccbill.com/doc/dynamic-pricing-flexforms',
    public: false,
    group: 'ccbill',
    editable: true,
    type: 'radio',
    meta: {
      value: [
        { key: '036', name: 'AUD' },
        { key: '124', name: 'CAD' },
        { key: '392', name: 'JPY' },
        { key: '826', name: 'GBP' },
        { key: '840', name: 'USD' },
        { key: '978', name: 'EUR' }
      ]
    }
  }
];

module.exports.up = async function up(next) {
  // eslint-disable-next-line no-console
  console.log('Migrate currency settings');

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
  console.log('Migrate currency settings done');
  next();
};

module.exports.down = function down(next) {
  next();
};
