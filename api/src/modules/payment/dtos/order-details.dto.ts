import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export class OrderDetailsDto {
  _id: ObjectId;

  orderId?: ObjectId;

  orderNumber?: string;

  buyerId?: ObjectId;

  buyerSource?: string;

  buyer?: any;

  sellerId?: ObjectId;

  sellerSource?: string;

  seller?: any;

  productType?: string;

  productId?: ObjectId;

  name?: string;

  description?: string;

  unitPrice?: number;

  quantity?: number;

  originalPrice?: number;

  totalPrice?: number;

  status?: string;

  deliveryStatus?: string;

  deliveryAddress?: string;

  phoneNumber?: string;

  postalCode?: string;

  payBy?: string;

  couponInfo?: any;

  shippingCode?: string;

  extraInfo?: any;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<OrderDetailsDto>) {
    data && Object.assign(
      this,
      pick(data, [
        '_id',
        'orderId',
        'orderNumber',
        'buyerId',
        'buyerSource',
        'buyer',
        'sellerId',
        'sellerSource',
        'seller',
        'productType',
        'productId',
        'name',
        'description',
        'unitPrice',
        'quantity',
        'totalPrice',
        'status',
        'deliveryStatus',
        'deliveryAddress',
        'phoneNumber',
        'postalCode',
        'payBy',
        'couponInfo',
        'shippingCode',
        'extraInfo',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
