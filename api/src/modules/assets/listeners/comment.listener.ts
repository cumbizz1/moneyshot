import { Injectable } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { COMMENT_CHANNEL, OBJECT_TYPE } from 'src/modules/comment/contants';

import { GalleryService, ProductService } from '../services';
import { VideoService } from '../services/video.service';

const COMMENT_ASSETS_TOPIC = 'COMMENT_ASSETS_TOPIC';

@Injectable()
export class CommentAssetsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly videoService: VideoService,
    private readonly productService: ProductService,
    private readonly galleryService: GalleryService
  ) {
    this.queueEventService.subscribe(
      COMMENT_CHANNEL,
      COMMENT_ASSETS_TOPIC,
      this.handleComment.bind(this)
    );
  }

  public async handleComment(event: QueueEvent) {
    if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
      return;
    }
    const { objectId, objectType } = event.data;
    const num = event.eventName === EVENT.CREATED ? 1 : -1;
    if (objectType === OBJECT_TYPE.VIDEO) {
      await this.videoService.handleUpdateStats(
        objectId,
        'stats.comments',
        num
      );
    }
    if (objectType === OBJECT_TYPE.PRODUCT) {
      await this.productService.handleUpdateStats(
        objectId,
        'stats.comments',
        num
      );
    }
    if (objectType === OBJECT_TYPE.GALLERY) {
      await this.galleryService.handleUpdateStats(
        objectId,
        'stats.comments',
        num
      );
    }
  }
}
