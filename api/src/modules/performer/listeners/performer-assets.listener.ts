import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { PHOTO_STATUS, PRODUCT_STATUS, VIDEO_STATUS } from 'src/modules/assets/constants';
import {
  COUNT_VIDEO_CHANNEL,
  PERFORMER_GALLERY_CHANNEL,
  PERFORMER_PRODUCT_CHANNEL
} from 'src/modules/assets/services';

import { PerformerModel } from '../models';
import { PERFORMER_MODEL_PROVIDER } from '../providers';

const HANDLE_VIDEO_COUNT_FOR_PERFORMER = 'HANDLE_VIDEO_COUNT_FOR_PERFORMER';
const HANDLE_PRODUCT_COUNT_FOR_PERFORMER = 'HANDLE_PRODUCT_COUNT_FOR_PERFORMER';
const HANDLE_GALLERY_COUNT_FOR_PERFORMER = 'HANDLE_GALLERY_COUNT_FOR_PERFORMER';

@Injectable()
export class PerformerAssetsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>
  ) {
    this.queueEventService.subscribe(
      COUNT_VIDEO_CHANNEL,
      HANDLE_VIDEO_COUNT_FOR_PERFORMER,
      this.handleVideoCount.bind(this)
    );
    this.queueEventService.subscribe(
      PERFORMER_GALLERY_CHANNEL,
      HANDLE_GALLERY_COUNT_FOR_PERFORMER,
      this.handleGalleryCount.bind(this)
    );
    this.queueEventService.subscribe(
      PERFORMER_PRODUCT_CHANNEL,
      HANDLE_PRODUCT_COUNT_FOR_PERFORMER,
      this.handleProductCount.bind(this)
    );
  }

  public async handleGalleryCount(event: QueueEvent) {
    const { eventName } = event;
    if (![EVENT.CREATED, EVENT.DELETED, EVENT.UPDATED].includes(eventName)) {
      return;
    }
    const { performerIds = [], status, oldStatus } = event.data;
    let increase = 0;

    switch (eventName) {
      case EVENT.CREATED:
        if (status === PHOTO_STATUS.ACTIVE) increase = 1;
        break;
      case EVENT.UPDATED:
        if (
          oldStatus !== PHOTO_STATUS.ACTIVE
            && status === PHOTO_STATUS.ACTIVE
        ) increase = 1;
        if (
          oldStatus === PHOTO_STATUS.ACTIVE
            && status !== PHOTO_STATUS.ACTIVE
        ) increase = -1;
        break;
      case EVENT.DELETED:
        if (status === PHOTO_STATUS.ACTIVE) increase = -1;
        break;
      default:
        break;
    }

    if (increase && performerIds.length) {
      await this.performerModel.updateMany(
        { _id: { $in: performerIds } },
        {
          $inc: {
            'stats.totalGalleries': increase
          }
        }
      );
    }
  }

  public async handleVideoCount(event: QueueEvent) {
    const { eventName } = event;
    if (![EVENT.CREATED, EVENT.DELETED, EVENT.UPDATED].includes(eventName)) {
      return;
    }
    const { performerIds, status, oldStatus } = event.data;
    let increase = 0;

    switch (eventName) {
      case EVENT.CREATED:
        if (status === VIDEO_STATUS.ACTIVE) increase = 1;
        break;
      case EVENT.UPDATED:
        if (
          oldStatus !== VIDEO_STATUS.ACTIVE
            && status === VIDEO_STATUS.ACTIVE
        ) increase = 1;
        if (
          oldStatus === VIDEO_STATUS.ACTIVE
            && status !== VIDEO_STATUS.ACTIVE
        ) increase = -1;
        break;
      case EVENT.DELETED:
        if (status === VIDEO_STATUS.ACTIVE) increase = -1;
        break;
      default:
        break;
    }
    if (increase) {
      await this.performerModel.updateMany(
        { _id: { $in: performerIds } },
        {
          $inc: {
            'stats.totalVideos': increase
          }
        }
      );
    }
  }

  public async handleProductCount(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (![EVENT.CREATED, EVENT.DELETED, EVENT.UPDATED].includes(eventName)) {
        return;
      }
      const { performerId, status, oldStatus } = event.data;
      let increase = 0;

      switch (eventName) {
        case EVENT.CREATED:
          if (status === PRODUCT_STATUS.ACTIVE) increase = 1;
          break;
        case EVENT.UPDATED:
          if (
            oldStatus !== PRODUCT_STATUS.ACTIVE
            && status === PRODUCT_STATUS.ACTIVE
          ) increase = 1;
          if (
            oldStatus === PRODUCT_STATUS.ACTIVE
            && status !== PRODUCT_STATUS.ACTIVE
          ) increase = -1;
          break;
        case EVENT.DELETED:
          if (status === PRODUCT_STATUS.ACTIVE) increase = -1;
          break;
        default:
          break;
      }
      if (increase) {
        await this.performerModel.updateOne(
          { _id: performerId },
          {
            $inc: {
              'stats.totalProducts': increase
            }
          }
        );
      }
    } catch (e) {
      // TODO - log me
      // console.log(e);
    }
  }
}
