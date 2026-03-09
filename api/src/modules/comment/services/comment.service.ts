/* eslint-disable no-param-reassign */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Model, SortOrder } from 'mongoose';
import {
  EntityNotFoundException, ForbiddenException, PageableData, QueueEvent, QueueEventService
} from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { ReactionService } from 'src/modules/reaction/services/reaction.service';

import { UserDto } from '../../user/dtos';
import { UserService } from '../../user/services';
import { COMMENT_CHANNEL } from '../contants';
import { CommentDto } from '../dtos/comment.dto';
import { CommentModel } from '../models/comment.model';
import {
  CommentCreatePayload, CommentEditPayload, CommentSearchRequestPayload
} from '../payloads';
import { COMMENT_MODEL_PROVIDER } from '../providers/comment.provider';

@Injectable()
export class CommentService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(COMMENT_MODEL_PROVIDER)
    private readonly commentModel: Model<CommentModel>,
    private readonly queueEventService: QueueEventService,
    private readonly reactionService: ReactionService
  ) {}

  public async increaseComment(commentId, num = 1) {
    await this.commentModel.updateOne({ _id: commentId }, { $inc: { totalReply: num } });
  }

  public async create(
    data: CommentCreatePayload,
    user: UserDto
  ): Promise<CommentDto> {
    const comment = { ...data } as any;
    comment.createdBy = user._id;
    comment.createdAt = new Date();
    comment.updatedAt = new Date();
    const newComment = await this.commentModel.create(comment);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: COMMENT_CHANNEL,
        eventName: EVENT.CREATED,
        data: new CommentDto(newComment)
      })
    );
    const returnData = new CommentDto(newComment);
    const userInfo = await this.userService.findById(user._id);
    returnData.creator = new UserDto(userInfo).toResponse();
    return returnData;
  }

  public async update(
    id: string | ObjectId,
    payload: CommentEditPayload,
    user: UserDto
  ): Promise<any> {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new EntityNotFoundException();
    }
    const data = { ...payload };
    if (comment.createdBy.toString() !== user._id.toString()) {
      throw new ForbiddenException();
    }
    await this.commentModel.updateOne({ _id: id }, data);
    return { updated: true };
  }

  public async delete(
    id: string | ObjectId,
    user: UserDto
  ) {
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new EntityNotFoundException();
    }
    if (comment.createdBy.toString() !== user._id.toString()) {
      throw new ForbiddenException();
    }
    await this.commentModel.deleteOne({ _id: id });
    await this.queueEventService.publish(
      new QueueEvent({
        channel: COMMENT_CHANNEL,
        eventName: EVENT.DELETED,
        data: new CommentDto(comment)
      })
    );
    return comment;
  }

  public async search(
    req: CommentSearchRequestPayload,
    user: UserDto
  ): Promise<PageableData<CommentDto>> {
    const query = {} as any;
    if (req.objectId) {
      query.objectId = req.objectId;
    }
    const sort: Record<string, SortOrder> = {
      createdAt: -1
    };
    const [data, total] = await Promise.all([
      this.commentModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.commentModel.countDocuments(query)
    ]);
    const comments = data.map((d) => new CommentDto(d));
    const commentIds = data.map((d) => d._id);
    const UIds = data.map((d) => d.createdBy);
    const [users, reactions] = await Promise.all([
      UIds.length ? this.userService.findByIds(UIds) : [],
      user && commentIds.length ? this.reactionService.findByQuery({ objectId: { $in: commentIds }, createdBy: user._id }) : []
    ]);
    comments.forEach((comment: CommentDto) => {
      const userComment = users.find((u) => u._id.toString() === comment.createdBy.toString());
      const liked = reactions.find((reaction) => reaction.objectId.toString() === comment._id.toString());
      // eslint-disable-next-line no-nested-ternary
      comment.creator = userComment ? new UserDto(userComment).toResponse() : null;
      comment.isLiked = !!liked;
    });
    return {
      data: comments,
      total
    };
  }
}
