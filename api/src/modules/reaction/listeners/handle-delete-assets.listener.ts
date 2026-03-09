import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import {
  COUNT_VIDEO_CHANNEL,
  PERFORMER_GALLERY_CHANNEL,
  PERFORMER_PRODUCT_CHANNEL
} from 'src/modules/assets/services';

import { ReactionModel } from '../models/reaction.model';
import { REACT_MODEL_PROVIDER } from '../providers/reaction.provider';

const DELETE_ASSETS_REACTION_TOPIC = 'DELETE_ASSETS_REACTION_TOPIC';

@Injectable()
export class DeleteAssetsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(REACT_MODEL_PROVIDER)
    private readonly reactionModel: Model<ReactionModel>
  ) {
    this.queueEventService.subscribe(
      COUNT_VIDEO_CHANNEL,
      DELETE_ASSETS_REACTION_TOPIC,
      this.handleDeleteData.bind(this)
    );
    this.queueEventService.subscribe(
      PERFORMER_GALLERY_CHANNEL,
      DELETE_ASSETS_REACTION_TOPIC,
      this.handleDeleteData.bind(this)
    );
    this.queueEventService.subscribe(
      PERFORMER_PRODUCT_CHANNEL,
      DELETE_ASSETS_REACTION_TOPIC,
      this.handleDeleteData.bind(this)
    );
  }

  private async handleDeleteData(event: QueueEvent): Promise<void> {
    if (event.eventName !== EVENT.DELETED) return;
    const { _id } = event.data as any;
    await this.reactionModel.deleteMany({
      objectId: _id
    });
  }
}
