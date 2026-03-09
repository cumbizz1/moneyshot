import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { PerformerService } from 'src/modules/performer/services';
import { REACTION, REACTION_CHANNEL, REACTION_TYPE } from 'src/modules/reaction/constants';

import { GalleryService } from '../services';
import { VideoService } from '../services/video.service';

const REACTION_VIDEO_CHANNEL = 'REACTION_VIDEO_CHANNEL';

@Injectable()
export class ReactionAssetsListener {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    private readonly queueEventService: QueueEventService,
    private readonly videoService: VideoService,
    private readonly galleryService: GalleryService
  ) {
    this.queueEventService.subscribe(
      REACTION_CHANNEL,
      REACTION_VIDEO_CHANNEL,
      this.handleReactAssets.bind(this)
    );
  }

  public async handleReactAssets(event: QueueEvent) {
    if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
      return;
    }
    const {
      objectId, objectType, action, performerId
    } = event.data;
    const num = event.eventName === EVENT.CREATED ? 1 : -1;
    if (objectType === REACTION_TYPE.VIDEO) {
      switch (action) {
        case REACTION.LIKE:
          await this.videoService.handleUpdateStats(
            objectId,
            'stats.likes',
            num
          );
          await this.performerService.updateLikeStat(performerId, num);
          break;
        case REACTION.FAVOURITE:
          await this.videoService.handleUpdateStats(
            objectId,
            'stats.favourites',
            num
          );
          break;
        case REACTION.WATCH_LATER:
          await this.videoService.handleUpdateStats(
            objectId,
            'stats.wishlist',
            num
          );
          break;
        default: break;
      }
    }
    if (objectType === REACTION_TYPE.GALLERY) {
      switch (action) {
        case REACTION.LIKE:
          await this.galleryService.handleUpdateStats(
            objectId,
            'stats.likes',
            num
          );
          await this.performerService.updateLikeStat(performerId, num);
          break;
        case REACTION.FAVOURITE:
          await this.galleryService.handleUpdateStats(
            objectId,
            'stats.favourites',
            num
          );
          break;
        default: break;
      }
    }
  }
}
