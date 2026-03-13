import { ISearch } from './utils';

export interface IProductPayment {
  name: string;
  description: string;
  price: number;
  productId: string;
  productType: string;
}

export interface IPayment {
  _id: string;
  products: IProductPayment[];
  paymentGateway: string;
  source: string;
  sourceId: string;
  target: string;
  targetId: string;
  type: string;
  status: string;
}

export interface IPaymentSearch extends ISearch {
  type: string;
  sourceId: string;
}

export interface IOrder {
  _id: string;

  orderId: string;

  orderNumber: string;

  buyerId: string;

  buyerSource: string;

  buyer: any;

  sellerId: string;

  sellerSource: any;

  seller: any;

  productType: string;

  productId: string;

  name: string;

  description: string;

  unitPrice: number;

  quantity: number;

  originalPrice: number;

  totalPrice: number;

  status: string;

  deliveryStatus: string;

  deliveryAddress: string;

  phoneNumber: string;

  postalCode: string;

  payBy: string;

  couponInfo: any;

  shippingCode: string

  extraInfo: any;

  createdAt: Date;

  updatedAt: Date;
}
