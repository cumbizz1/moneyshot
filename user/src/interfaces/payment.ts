export class PaymentProductModel {
  name: string;

  description: string;

  price: number;

  extraInfo: any;

  productType: string;

  productId: string;
}

export interface ITransaction {
  paymentGateway: string;
  source: string;
  sourceId: string;
  target: string;
  targetId: string;
  type: string;
  paymentResponseInfo: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  products: PaymentProductModel[];
}

export interface ICoupon {
  _id: string;
  name: string;
  description: string;
  code: string;
  value: number;
  expiredDate: string | Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder {
  _id: string;
  name: string;
  productType: string;
  transactionId: string;
  sellerId: string;
  seller: any;
  buyerId: string;
  buyer: any;
  orderNumber: string;
  shippingCode: string;
  productIds: string[];
  productsInfo: any[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryAddress: string;
  deliveryStatus: string;
  postalCode: string;
  phoneNumber: string;
  payBy: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
  couponInfo: any;
}
