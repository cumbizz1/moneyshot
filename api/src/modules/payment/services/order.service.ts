import {
  ForbiddenException,
  forwardRef, HttpException, Inject, Injectable
} from '@nestjs/common';
import * as moment from 'moment';
import { ObjectId } from 'mongodb';
import { Model, SortOrder } from 'mongoose';
import {
  EntityNotFoundException, StringHelper
} from 'src/kernel';
import { PERFORMER_VIDEO_MODEL_PROVIDER } from 'src/modules/assets/providers';
import {
  ProductService, VideoService
} from 'src/modules/assets/services';
import { CouponService } from 'src/modules/coupon/services';
import { MailerService } from 'src/modules/mailer';
import { PerformerDto } from 'src/modules/performer/dtos';
import { PerformerService } from 'src/modules/performer/services';
import { SubscriptionPackageService } from 'src/modules/subscription/services';
import { UserDto } from 'src/modules/user/dtos';
import { UserService } from 'src/modules/user/services';

import {
  DELIVERY_STATUS,
  ORDER_STATUS,
  PAYMENT_TYPE,
  PRODUCT_TYPE
} from '../constants';
import { OrderDetailsDto, OrderDto } from '../dtos';
import { OrderDetailsModel, OrderModel } from '../models';
import {
  OrderSearchPayload, OrderUpdatePayload, PurchaseProductsPayload, PurchaseVideoPayload, SubscribePayload
} from '../payloads';
import { ORDER_DETAIL_MODEL_PROVIDER, ORDER_MODEL_PROVIDER } from '../providers';

@Injectable()
export class OrderService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    private readonly videoService: VideoService,
    @Inject(forwardRef(() => CouponService))
    private readonly couponService: CouponService,
    @Inject(ORDER_MODEL_PROVIDER)
    private readonly orderModel: Model<OrderModel>,
    @Inject(ORDER_DETAIL_MODEL_PROVIDER)
    private readonly orderDetailModel: Model<OrderDetailsModel>,
    private readonly mailService: MailerService,
    private readonly userService: UserService,
    private readonly subscriptionPackageService: SubscriptionPackageService
  ) { }

  public async findById(id: string | ObjectId) {
    return this.orderModel.findById(id);
  }

  public async findByIds(ids: string[] | ObjectId[]) {
    return this.orderModel.find({ _id: { $in: ids } });
  }

  public async findByQuery(payload: any) {
    const data = await this.orderModel.find(payload);
    return data;
  }

  public async findOrderDetailsByQuery(payload: any) {
    const data = await this.orderDetailModel.find(payload);
    return data;
  }

  public async findOrdersAndUpdateFailStatus(orderId: ObjectId) {
    await this.orderModel.updateOne({ _id: orderId }, { status: ORDER_STATUS.FAILED, deliveryStatus: DELIVERY_STATUS.FAILED });
    await this.orderDetailModel.updateMany({ orderId }, { status: ORDER_STATUS.FAILED, deliveryStatus: DELIVERY_STATUS.FAILED });
  }

  /**
   * search in order collections
   * @param req
   * @param user
   */
  public async search(req: OrderSearchPayload) {
    const query = {
    } as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        { orderNumber: searchValue },
        { name: searchValue },
        { description: searchValue }
      ];
    }
    if (req.sellerId) query.sellerId = req.sellerId;
    if (req.buyerId) query.buyerId = req.buyerId;
    if (req.userId) query.buyerId = req.userId;
    if (req.status) query.status = req.status;
    if (req.deliveryStatus) query.deliveryStatus = req.deliveryStatus;
    if (req.type) query.type = req.type;
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).toDate(),
        $lt: moment(req.toDate).toDate()
      };
    }
    const sort: Record<string, SortOrder> = {
      [req.sortBy || 'updatedAt']: req.sort || -1
    };
    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.orderModel.countDocuments(query)
    ]);
    const data = orders.map((o) => new OrderDto(o));
    const orderIds = orders.map((o) => o._id);
    // const performerIds = orders.filter((o) => o.sellerSource === 'performer').map((o) => o.sellerId);
    const userIds = orders.filter((o) => o.buyerSource === 'user').map((o) => o.buyerId);
    const sellers = [];
    const buyers = [];
    const orderDetails = [];
    // if (performerIds.length) {
    //   const performers = await this.performerService.findByIds(performerIds);
    //   sellers.push(
    //     ...performers.map((p) => (new PerformerDto(p)).toResponse())
    //   );
    // }
    if (userIds.length) {
      const users = await this.userService.findByIds(userIds);
      buyers.push(
        ...users.map((u) => (new UserDto(u)).toResponse())
      );
    }

    if (orderIds.length) {
      const orderDetailsList = await this.orderDetailModel.find({
        orderId: {
          $in: orderIds
        }
      });
      orderDetails.push(...orderDetailsList);
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const order of data) {
      if (order.sellerId) {
        order.seller = sellers.find((s) => s._id.toString() === order.sellerId.toString());
      }
      if (order.buyerId) {
        order.buyer = buyers.find((b) => b._id.toString() === order.buyerId.toString());
      }
      order.details = orderDetails.filter((d) => d.orderId.toString() === order._id.toString());
    }

    return {
      data,
      total
    };
  }

  public async orderDetailsSearch(req: OrderSearchPayload) {
    const query = {} as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        { orderNumber: searchValue },
        { name: searchValue },
        { description: searchValue }
      ];
    }
    if (req.sellerId) query.sellerId = req.sellerId;
    if (req.buyerId) query.buyerId = req.buyerId;
    if (req.userId) query.buyerId = req.userId;
    if (req.status) query.status = req.status;
    if (req.deliveryStatus) query.deliveryStatus = req.deliveryStatus;
    if (req.productType) query.productType = req.productType;
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).toDate(),
        $lt: moment(req.toDate).toDate()
      };
    }
    const sort: Record<string, SortOrder> = {
      [req.sortBy || 'updatedAt']: req.sort || -1
    };
    const [orders, total] = await Promise.all([
      this.orderDetailModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.orderDetailModel.countDocuments(query)
    ]);

    const sellers = [];
    const buyers = [];
    // const performerIds = orders.filter((o) => o.sellerSource === 'performer').map((o) => o.sellerId);
    const userIds = orders.filter((o) => o.buyerSource === 'user').map((o) => o.buyerId);
    // if (performerIds.length) {
    //   const performers = await this.performerService.findByIds(performerIds);
    //   sellers.push(
    //     ...performers.map((p) => (new PerformerDto(p)).toResponse())
    //   );
    // }
    if (userIds.length) {
      const users = await this.userService.findByIds(userIds);
      buyers.push(
        ...users.map((u) => (new UserDto(u)).toResponse())
      );
    }

    const data = orders.map((o) => new OrderDetailsDto(o));

    // eslint-disable-next-line no-restricted-syntax
    for (const order of data) {
      if (order.sellerId) {
        order.seller = sellers.find((s) => s._id.toString() === order.sellerId.toString());
      }
      if (order.buyerId) {
        order.buyer = buyers.find((b) => b._id.toString() === order.buyerId.toString());
      }
    }

    return {
      data,
      total
    };
  }

  public async getOrderDetails(id: string | ObjectId) {
    const details = await this.orderDetailModel.findById(id);
    if (!details) {
      throw new EntityNotFoundException();
    }

    const dto = new OrderDetailsDto(details);
    if (details.buyerSource === 'user') {
      const user = await this.userService.findById(details.buyerId);
      dto.buyer = (new UserDto(user)).toResponse();
    }

    if (details.sellerSource === 'performer') {
      const performer = await this.performerService.findById(details.sellerId);
      dto.seller = (new PerformerDto(performer)).toResponse();
    }

    return dto;
  }

  public async updateDetails(id: string, payload: OrderUpdatePayload, currentUser: UserDto) {
    const details = await this.orderDetailModel.findById(id);
    if (!details) {
      throw new EntityNotFoundException();
    }

    const oldStatus = details.deliveryStatus;
    if (!currentUser.roles?.includes('admin') && currentUser._id.toString() !== details.sellerId.toString()) {
      throw new ForbiddenException();
    }

    await this.orderDetailModel.updateMany({ orderId: details.orderId }, payload);
    await this.orderModel.updateOne({ _id: details.orderId }, payload);
    const order = await this.orderModel.findById(details.orderId);
    if (order.deliveryStatus !== ORDER_STATUS.CREATED && order.deliveryStatus !== oldStatus) {
      if (details.buyerSource === 'user') {
        const user = await this.userService.findById(details.buyerId);
        if (user) {
          await this.mailService.send({
            subject: 'Order status changed',
            to: user.email,
            data: {
              userName: user.name || user.username || 'there',
              order,
              deliveryStatus: order.deliveryStatus,
              oldDeliveryStatus: oldStatus
            },
            template: 'update-order-status'
          });
        }
      }
    }
  }

  public generateOrderNumber() {
    return `${StringHelper.randomString(8)}`.toUpperCase();
  }

  /**
   * create order with created status, means just place cart to order and waiting to process
   * @param payload
   * @param user
   * @param orderStatus
   */
  public async createFromProducts(payload: PurchaseProductsPayload, user: UserDto, buyerSource = 'user', orderStatus = ORDER_STATUS.CREATED) {
    const {
      products, deliveryAddress, phoneNumber, postalCode
    } = payload;
    const productIds = payload.products.map((p) => p._id);
    const prods = await this.productService.findByIds(productIds);
    if (!products.length || !prods.length) {
      throw new EntityNotFoundException();
    }

    let totalQuantity = 0;
    let originalPrice = 0;
    let coupon = null;
    if (payload.couponCode) {
      coupon = await this.couponService.applyCoupon(
        payload.couponCode,
        user._id
      );
    }

    const orderDetails = [];
    prods.forEach((p) => {
      const groupProducts = products.filter((op) => op._id.toString() === p._id.toString());
      let productQuantity = 0;
      groupProducts.forEach((op) => {
        productQuantity += op.quantity;
      });
      const originalProductPrice = productQuantity * p.price;
      const totalPrice = coupon ? originalProductPrice - (originalProductPrice * coupon.value) : originalProductPrice;
      totalQuantity += productQuantity;
      originalPrice += originalProductPrice;
      orderDetails.push({
        buyerId: user._id,
        buyerSource: 'user',
        sellerId: null,
        sellerSource: 'admin',
        name: p.name,
        description: p.description,
        unitPrice: p.price,
        originalPrice: originalProductPrice,
        totalPrice,
        productType: p.type,
        productId: p._id,
        quantity: productQuantity,
        status: orderStatus,
        payBy: 'money', // default!!
        deliveryStatus: DELIVERY_STATUS.CREATED,
        deliveryAddress,
        phoneNumber,
        postalCode,
        couponInfo: coupon
      });
    });

    const totalPrice = coupon ? originalPrice - originalPrice * coupon.value : originalPrice;

    const order = await this.orderModel.create({
      buyerId: user._id,
      buyerSource,
      sellerId: null,
      sellerSource: 'system',
      type: PAYMENT_TYPE.PRODUCT,
      orderNumber: this.generateOrderNumber(),
      quantity: totalQuantity,
      originalPrice,
      totalPrice,
      couponInfo: coupon,
      status: orderStatus,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      deliveryAddress,
      postalCode,
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await Promise.all(orderDetails.map((data, index) => {
      const detail = data;
      detail.orderId = order._id;
      detail.orderNumber = `${order.orderNumber}-S${index + 1}`;
      return this.orderDetailModel.create(detail);
    }));

    return order;
  }

  public async createFromVOD(payload: PurchaseVideoPayload, user: UserDto, buyerSource = 'user', orderStatus = ORDER_STATUS.CREATED) {
    // TODO - check if VOD video has been purchased
    const video = await this.videoService.findById(payload.videoId);
    if (!video || !video.isSale || !video.price) {
      throw new EntityNotFoundException();
    }

    const originalPrice = video.price;
    let coupon = null;
    if (payload.couponCode) {
      coupon = await this.couponService.applyCoupon(
        payload.couponCode,
        user._id
      );
    }
    const totalPrice = coupon ? originalPrice - originalPrice * coupon.value : originalPrice;

    const order = await this.orderModel.create({
      buyerId: user._id,
      buyerSource,
      sellerId: null,
      sellerSource: 'system',
      type: PAYMENT_TYPE.SALE_VIDEO,
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: 1,
      originalPrice,
      totalPrice,
      couponInfo: coupon,
      status: orderStatus,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      deliveryAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.orderDetailModel.create({
      orderId: order._id,
      orderNumber: `${order.orderNumber}`,
      buyerId: user._id,
      buyerSource: 'user',
      sellerId: null,
      sellerSource: 'system',
      name: video.title,
      description: video.description,
      unitPrice: video.price,
      originalPrice,
      totalPrice,
      productType: PRODUCT_TYPE.SALE_VIDEO,
      productId: video._id,
      quantity: 1,
      payBy: 'money', // default!!
      status: orderStatus,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      couponInfo: coupon
    });

    return order;
  }

  public async createForSubscription(payload: SubscribePayload, user: UserDto, buyerSource = 'user', orderStatus = ORDER_STATUS.CREATED) {
    const subscriptionPackage = await this.subscriptionPackageService.findById(payload.packageId);
    if (!subscriptionPackage) throw new HttpException('Subscription package not found', 404);

    const order = await this.orderModel.create({
      buyerId: user._id,
      buyerSource,
      sellerId: null,
      sellerSource: 'system',
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: 1,
      type: PAYMENT_TYPE.SUBSCRIPTION_PACKAGE,
      originalPrice: subscriptionPackage.price,
      totalPrice: subscriptionPackage.price,
      couponInfo: null,
      status: orderStatus,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      deliveryAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const { name, description } = subscriptionPackage;
    const orderDetails = await this.orderDetailModel.create({
      orderId: order._id,
      orderNumber: `${order.orderNumber}`,
      buyerId: user._id,
      buyerSource: 'user',
      sellerId: null,
      sellerSource: 'system',
      name,
      description,
      unitPrice: subscriptionPackage.price,
      originalPrice: subscriptionPackage.price,
      totalPrice: subscriptionPackage.price,
      productType: PAYMENT_TYPE.SUBSCRIPTION_PACKAGE,
      productId: subscriptionPackage._id,
      quantity: 1,
      payBy: 'money', // default!!
      status: orderStatus,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      couponInfo: null,
      extraInfo: {
        recurring: subscriptionPackage?.type === 'recurring',
        recurringPeriod: subscriptionPackage?.recurringPeriod,
        initalPeriod: subscriptionPackage?.initialPeriod
      }
    });

    return {
      order,
      orderDetails,
      subscriptionPackage
    };
  }

  public async createForSubscriptionRenewal({
    userId,
    type,
    price
  }, buyerSource = 'user', orderStatus = ORDER_STATUS.CREATED, deliveryStatus = DELIVERY_STATUS.CREATED) {
    const user = await this.userService.findById(userId);
    const order = await this.orderModel.create({
      buyerId: userId,
      buyerSource,
      sellerId: null,
      sellerSource: 'system',
      type,
      orderNumber: this.generateOrderNumber(),
      postalCode: '',
      quantity: 1,
      totalPrice: price,
      couponInfo: null,
      status: orderStatus,
      deliveryStatus,
      deliveryAddress: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const name = 'Renewal subscription';
    const description = name;
    await this.orderDetailModel.create({
      orderId: order._id,
      orderNumber: `${order.orderNumber}`,
      buyerId: user._id,
      buyerSource: 'user',
      sellerId: null,
      sellerSource: 'system',
      name,
      description,
      unitPrice: price,
      originalPrice: price,
      totalPrice: price,
      productType: PAYMENT_TYPE.SUBSCRIPTION_PACKAGE,
      productId: null, // TODO -add me
      quantity: 1,
      payBy: 'money', // default!!
      status: orderStatus,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      couponInfo: null
    });

    return order;
  }
}
