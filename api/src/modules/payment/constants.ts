export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};
export const PAYMENT_TYPE = {
  SALE_VIDEO: 'video',
  SALE_GALLERY: 'gallery',
  PRODUCT: 'product',
  SUBSCRIPTION_PACKAGE: 'subscription_package'
};
export const PAYMENT_TARTGET_TYPE = {
  PRODUCT: 'product',
  VIDEO: 'video',
  GALLERY: 'gallery'
};

export const TRANSACTION_SUCCESS_CHANNEL = 'TRANSACTION_SUCCESS_CHANNEL';
export const ORDER_PAID_SUCCESS_CHANNEL = 'ORDER_PAID_SUCCESS_CHANNEL';

export const OVER_PRODUCT_STOCK = 'OVER_PRODUCT_STOCK';
export const DIFFERENT_PERFORMER_PRODUCT = 'DIFFERENT_PERFORMER_PRODUCT';
export const MISSING_CONFIG_PAYMENT_GATEWAY = 'Payment gateway has not been configured yet';

export const ORDER_STATUS = {
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  REFUNDED: 'refunded',
  PENDING: 'pending',
  CREATED: 'created',
  PAID: 'paid',
  FAILED: 'failed'
};

export const DELIVERY_STATUS = {
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CREATED: 'created',
  FAILED: 'failed'
};

export const PRODUCT_TYPE = {
  SUBSCRIPTION_PACKAGE: 'subscription_package',
  SALE_VIDEO: 'video',
  DIGITAL_PRODUCT: 'digital',
  PHYSICAL_PRODUCT: 'physical'
};
