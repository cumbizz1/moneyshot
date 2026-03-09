export const SETTING_CHANNEL = 'SETTINGS';

export const SETTING_KEYS = {
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
  CCBILL_CLIENT_ACCOUNT_NUMBER: 'ccbillClientAccountNumber',
  CCBILL_SUBSCRIPTION_SUB_ACCOUNT_NUMBER: 'ccbillSubscriptionSubAccountNumber',
  CCBILL_SINGLE_SUB_ACCOUNT_NUMBER: 'ccbillSingleSubAccountNumber',
  CCBILL_FLEXFORM_ID: 'ccbillFlexformId',
  CCBILL_SUBSCRIPTION_SALT: 'ccbillSubscriptionSalt',
  CCBILL_SINGLE_SALT: 'ccbillSingleSalt',
  CCBILL_DATALINK_USERNAME: 'ccbillDatalinkUsername',
  CCBILL_DATALINK_PASSWORD: 'ccbillDatalinkPassword',
  CCBILL_ENABLE: 'ccbillEnable',
  GOOGLE_ANALYTICS_CODE: 'gaCode',
  MAINTENANCE_MODE: 'maintenanceMode',
  FOOTER_CONTENT: 'footerContent',
  SMTP_HOST: 'smtpHost',
  SMTP_PORT: 'smtpPort',
  SMTP_USER: 'smtpUser',
  SMTP_PASSWORD: 'smtpPassword',
  SMTP_SECURE: 'smtpSecure',

  // custom content
  WELCOME_PAGE_ID: 'welcomePageId',
  HOME_CONTENT_PAGE_ID: 'homeContentPageId',
  CONTACT_PAGE_ID: 'contactPageId',

  // currency code
  CURRENCY: 'currency',
  CURRENCY_SYMBOL: 'currencySymbol',
  CCBILL_CURRENCY_CODE: 'ccbillCurrencyCode',

  LINK_API_BASE_URL: 'linkApiBaseUrl',
  LINK_VERIFICATION_SUCCESS_URL: 'linkVerificationSuccessUrl',

  FTP_FOLDER_PATH: 'ftpFolderPath',

  // s3
  AWS_S3_ENABLE: 's3Enabled',
  AWS_S3_REGION_NAME: 's3RegionName',
  AWS_S3_ACCESS_KEY_ID: 's3AccessKeyId',
  AWS_S3_SECRET_ACCESS_KEY: 's3SecretAccessKey',
  AWS_S3_BUCKET_ENDPOINT: 's3BucketEnpoint',
  AWS_S3_BUCKET_NAME: 's3BucketName',


  // curo payment
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

export const MENU_SECTION = {
  MAIN: 'main',
  HEADER: 'header',
  FOOTER: 'footer'
};
