const { DB, COLLECTION } = require('./lib');

const SETTING_KEYS = {
  SITE_NAME: 'siteName',
  LOGO_URL: 'logoUrl',
  FAVICON: 'favicon',
  LOGIN_PLACEHOLDER_IMAGE: 'loginPlaceholderImage',
  REQUIRE_EMAIL_VERIFICATION: 'requireEmailVerification',
  ADMIN_EMAIL: 'adminEmail',
  SENDER_EMAIL: 'senderEmail',
  META_KEYWORDS: 'metaKeywords',
  META_DESCRIPTION: 'metaDescription',
  HEADER_SCRIPT: 'headerScript',
  AFTER_BODY_SCRIPT: 'afterBodyScript',
  SMTP_TRANSPORTER: 'smtpTransporter',
  GOOGLE_ANALYTICS_CODE: 'gaCode',
  MAINTENANCE_MODE: 'maintenanceMode',
  FOOTER_CONTENT: 'footerContent',
  SMTP_HOST: 'smtpHost',
  SMTP_PORT: 'smtpPort',
  SMTP_USER: 'smtpUser',
  SMTP_PASSWORD: 'smtpPassword',
  SMTP_SECURE: 'smtpSecure'
};

const settings = [
  {
    key: SETTING_KEYS.SITE_NAME,
    value: process.env.SITE_NAME || process.env.DOMAIN || 'Application',
    name: 'Site name',
    description: 'Global name',
    public: true,
    group: 'general',
    editable: true
  },
  {
    key: SETTING_KEYS.LOGO_URL,
    value: '',
    name: 'Logo',
    description: 'Site logo',
    public: true,
    group: 'general',
    editable: true,
    meta: {
      upload: true,
      image: true
    }
  },
  {
    key: SETTING_KEYS.FAVICON,
    value: '',
    name: 'Favicon',
    description: 'Site Favicon',
    public: true,
    group: 'general',
    editable: true,
    meta: {
      upload: true,
      image: true
    }
  },
  {
    key: SETTING_KEYS.LOGIN_PLACEHOLDER_IMAGE,
    value: '',
    name: 'Placeholder img on login page',
    description: 'Login placeholder image on login page',
    public: true,
    group: 'general',
    editable: true,
    meta: {
      upload: true,
      image: true
    }
  },
  {
    key: SETTING_KEYS.FOOTER_CONTENT,
    value: `<p style="text-align:center;"><strong>${process.env.DOMAIN} © Copyright 2021</strong></p><p style="text-align:center;"></p style="text-align: center"><img src="https://www.dmca.com/img/dmca_logo.png?=sd" alt="" style="width: 70px"/><p></p>`,
    name: 'Footer content',
    description: 'Add texts for your footer here',
    public: true,
    group: 'general',
    editable: true,
    type: 'text-editor'
  },
  {
    key: SETTING_KEYS.REQUIRE_EMAIL_VERIFICATION,
    value: false,
    name: 'Mandatory email verification',
    description:
      'If active, user must verify email before login to system',
    type: 'boolean',
    public: false,
    group: 'general',
    editable: true
  },
  {
    key: SETTING_KEYS.MAINTENANCE_MODE,
    value: false,
    name: 'Maintenance mode',
    description:
      'If active, user will see maintenance page once visiting site',
    type: 'boolean',
    public: true,
    group: 'general',
    editable: true
  },
  {
    key: SETTING_KEYS.ADMIN_EMAIL,
    value: process.env.ADMIN_EMAIL || `admin@${process.env.DOMAIN}`,
    name: 'Admin email',
    description: 'Email will receive information from site features',
    public: false,
    type: 'text',
    group: 'email',
    editable: true
  },
  {
    key: SETTING_KEYS.SENDER_EMAIL,
    value: process.env.SENDER_EMAIL || `noreply@${process.env.DOMAIN}`,
    name: 'Sender email',
    description: 'Email will send application email',
    public: false,
    type: 'text',
    group: 'email',
    editable: true
  },
  {
    key: SETTING_KEYS.META_KEYWORDS,
    value: '',
    name: 'Home meta keywords',
    description: 'Custom meta keywords',
    public: true,
    type: 'text',
    group: 'custom',
    editable: true
  },
  {
    key: SETTING_KEYS.META_DESCRIPTION,
    value: '',
    name: 'Home meta description',
    description: 'Custom meta description',
    public: true,
    group: 'custom',
    editable: true,
    type: 'text',
    meta: {
      textarea: true
    }
  },
  {
    key: SETTING_KEYS.HEADER_SCRIPT,
    value: '',
    name: 'Custom header script',
    description: 'Custom code in <head> tag',
    public: true,
    group: 'custom',
    editable: true,
    type: 'text',
    meta: {
      textarea: true
    }
  },
  {
    key: SETTING_KEYS.AFTER_BODY_SCRIPT,
    value: '',
    name: 'Custom body script',
    description: 'Custom code at end of <body> tag',
    public: true,
    group: 'custom',
    editable: true,
    type: 'text',
    meta: {
      textarea: true
    }
  },
  {
    key: SETTING_KEYS.SMTP_HOST,
    value: '',
    name: 'SMTP host',
    description: '',
    public: false,
    group: 'smtp',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.SMTP_PORT,
    value: '465',
    name: 'SMTP port',
    description: '',
    public: false,
    group: 'smtp',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.SMTP_SECURE,
    value: true,
    name: 'SMTP secure',
    description: 'true for port 465, false for other ports',
    public: false,
    group: 'smtp',
    editable: true,
    type: 'boolean'
  },
  {
    key: SETTING_KEYS.SMTP_USER,
    value: '',
    name: 'SMTP username',
    description: '',
    public: false,
    group: 'smtp',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.SMTP_PASSWORD,
    value: '',
    name: 'SMTP password',
    description: '',
    public: false,
    group: 'smtp',
    editable: true,
    type: 'text'
  },
  {
    key: SETTING_KEYS.GOOGLE_ANALYTICS_CODE,
    value: '',
    name: 'GA code',
    description: 'Google Analytics Code eg: GA-123456xx',
    public: true,
    group: 'analytics',
    editable: true,
    type: 'text'
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
  console.log('Migrate settings done');
  next();
};

module.exports.down = function down(next) {
  next();
};
