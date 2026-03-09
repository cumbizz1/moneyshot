import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { SUBSCRIPTION_STATUS } from 'src/modules/subscription/constants';

import {
  GalleryModel, PhotoModel, ProductModel, VideoModel
} from '../../assets/models';
import {
  PERFORMER_GALLERY_MODEL_PROVIDER, PERFORMER_PHOTO_MODEL_PROVIDER,
  PERFORMER_PRODUCT_MODEL_PROVIDER, PERFORMER_VIDEO_MODEL_PROVIDER
} from '../../assets/providers';
import { ORDER_STATUS } from '../../payment/constants';
import { OrderDetailsModel, OrderModel } from '../../payment/models';
import { ORDER_DETAIL_MODEL_PROVIDER, ORDER_MODEL_PROVIDER } from '../../payment/providers';
import { PerformerModel } from '../../performer/models';
import { PERFORMER_MODEL_PROVIDER } from '../../performer/providers';
import { SubscriptionModel } from '../../subscription/models/subscription.model';
import { SUBSCRIPTION_MODEL_PROVIDER } from '../../subscription/providers/subscription.provider';
import { STATUS_ACTIVE, STATUS_INACTIVE } from '../../user/constants';
import { UserModel } from '../../user/models';
import { USER_MODEL_PROVIDER } from '../../user/providers';

@Injectable()
export class StatisticService {
  constructor(
    @Inject(PERFORMER_GALLERY_MODEL_PROVIDER)
    private readonly galleryModel: Model<GalleryModel>,
    @Inject(PERFORMER_PHOTO_MODEL_PROVIDER)
    private readonly photoModel: Model<PhotoModel>,
    @Inject(PERFORMER_PRODUCT_MODEL_PROVIDER)
    private readonly productModel: Model<ProductModel>,
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    private readonly videoModel: Model<VideoModel>,
    @Inject(USER_MODEL_PROVIDER)
    private readonly userModel: Model<UserModel>,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>,
    @Inject(SUBSCRIPTION_MODEL_PROVIDER)
    private readonly subscriptionModel: Model<SubscriptionModel>,
    @Inject(ORDER_DETAIL_MODEL_PROVIDER)
    private readonly orderDetailModel: Model<OrderDetailsModel>,
    @Inject(ORDER_MODEL_PROVIDER)
    private readonly orderModel: Model<OrderModel>
  ) { }

  public async stats(): Promise<any> {
    const totalActiveUsers = await this.userModel.countDocuments({ status: STATUS_ACTIVE });
    const totalInactiveUsers = await this.userModel.countDocuments({ status: STATUS_INACTIVE });
    const totalPerformers = await this.performerModel.countDocuments({ });
    const totalGalleries = await this.galleryModel.countDocuments({ });
    const totalPhotos = await this.photoModel.countDocuments({ });
    const totalVideos = await this.videoModel.countDocuments({});
    const totalActiveSubscribers = await this.subscriptionModel.countDocuments({ expiredAt: { $gt: new Date() }, status: SUBSCRIPTION_STATUS.ACTIVE });
    const totalSubscribers = await this.subscriptionModel.countDocuments({ });
    const totalCreatedOrders = await this.orderDetailModel.countDocuments({ deliveryStatus: ORDER_STATUS.CREATED });
    const totalDeliveredOrders = await this.orderDetailModel.countDocuments({ deliveryStatus: ORDER_STATUS.DELIVERED });
    const totalShippingdOrders = await this.orderDetailModel.countDocuments({ deliveryStatus: ORDER_STATUS.SHIPPING });
    const totalRefundedOrders = await this.orderDetailModel.countDocuments({ deliveryStatus: ORDER_STATUS.REFUNDED });
    const totalProducts = await this.productModel.countDocuments({});
    const [totalMoneyEarnings] = await Promise.all([
      this.orderModel.aggregate([
        {
          $match: {
            status: ORDER_STATUS.PAID
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$totalPrice'
            }
          }
        }
      ])
    ]);

    return {
      totalActiveUsers,
      totalInactiveUsers,
      totalPerformers,
      totalGalleries,
      totalPhotos,
      totalVideos,
      totalProducts,
      totalActiveSubscribers,
      totalSubscribers,
      totalCreatedOrders,
      totalDeliveredOrders,
      totalShippingdOrders,
      totalRefundedOrders,
      totalMoneyEarnings: (totalMoneyEarnings && totalMoneyEarnings[0] && totalMoneyEarnings[0].total) || 0
    };
  }
}
