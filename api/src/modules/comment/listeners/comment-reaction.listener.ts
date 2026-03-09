import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { PerformerService } from 'src/modules/performer/services';
import { REACTION, REACTION_CHANNEL, REACTION_TYPE } from 'src/modules/reaction/constants';

import { CommentModel } from '../models/comment.model';
import { COMMENT_MODEL_PROVIDER } from '../providers/comment.provider';

const REACTION_COMMENT_TOPIC = 'REACTION_COMMENT_TOPIC';

@Injectable()
export class ReactionCommentListener {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    private readonly queueEventService: QueueEventService,
    @Inject(COMMENT_MODEL_PROVIDER)
    private readonly commentModel: Model<CommentModel>
  ) {
    this.queueEventService.subscribe(
      REACTION_CHANNEL,
      REACTION_COMMENT_TOPIC,
      this.handleReactComment.bind(this)
    );
  }

  public async handleReactComment(event: QueueEvent) {
    if (![EVENT.CREATED, EVENT.DELETED].includes(event.eventName)) {
      return;
    }
    const { objectId, objectType, action } = event.data;
    if (![REACTION_TYPE.COMMENT].includes(objectType) || action !== REACTION.LIKE) {
      return;
    }
    const comment = await this.commentModel.findById(objectId);
    if (event.eventName === EVENT.CREATED) {
      if (comment) {
        await this.commentModel.updateOne({ _id: objectId }, { $inc: { totalLike: 1 } });
      }
    }
    if (event.eventName === EVENT.DELETED) {
      if (comment) {
        await this.commentModel.updateOne({ _id: objectId }, { $inc: { totalLike: -1 } });
      }
    }
  }
}
