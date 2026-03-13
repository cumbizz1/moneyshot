const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  LINK_API_BASE_URL: 'linkApiBaseUrl',
  LINK_VERIFICATION_SUCCESS_URL: 'linkVerificationSuccessUrl'
};

const settings = [
  {
    key: SETTING_KEYS.LINK_API_BASE_URL,
    value: `https://api.${process.env.DOMAIN}`,
    name: 'Api base url',
    description: 'The api base url https://api.your-domain.com',
    public: false,
    group: 'links',
    editable: true
  },
  {
    key: SETTING_KEYS.LINK_VERIFICATION_SUCCESS_URL,
    value: `https://${process.env.DOMAIN}/auth/email-verified-success`,
    name: 'Email verify success redirect url',
    description:
      'The link after user click on email verify link and open verification success page. Default https://your-domain.com/auth/email-verified-success',
    public: false,
    group: 'links',
    editable: true
  }
];

module.exports.up = async function up(next) {
  // eslint-disable-next-line no-console
  console.log('Migrate settings');

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
