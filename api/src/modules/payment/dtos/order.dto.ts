import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export class OrderDto {
  _id: ObjectId;

  orderNumber: string;

  buyerId: ObjectId;

  buyerSource: string;

  sellerId: ObjectId;

  sellerSource: string;

  type: string;

  details: any[];

  status: string;

  quantity: number;

  totalPrice: number;

  originalPrice?: number;

  deliveryStatus?: string;

  deliveryAddress?: string;

  phoneNumber?: string;

  postalCode?: string;

  couponInfo: any;

  seller: any;

  buyer: any;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<OrderDto>) {
    data
      && Object.assign(
        this,
        pick(data, [
          '_id',
          'orderNumber',
          'buyerId',
          'buyerSource',
          'sellerId',
          'sellerSource',
          'type',
          'quantity',
          'totalPrice',
          'originalPrice',
          'deliveryStatus',
          'deliveryAddress',
          'phoneNumber',
          'postalCode',
          'couponInfo',
          'buyer',
          'seller',
          'status',
          'details',
          'createdAt',
          'updatedAt'
        ])
      );
  }
}
