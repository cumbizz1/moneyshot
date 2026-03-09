import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { uniq } from 'lodash';
import { ObjectId } from 'mongodb';
import { Model, SortOrder } from 'mongoose';
import { PageableData, QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { GalleryDto, VideoDto } from 'src/modules/assets/dtos';
import { GalleryService, PhotoService, VideoService } from 'src/modules/assets/services';
import { FileService } from 'src/modules/file/services';

import { PerformerService } from '../../performer/services';
import { UserDto } from '../../user/dtos';
import { UserService } from '../../user/services';
import { REACTION_CHANNEL, REACTION_TYPE } from '../constants';
import { ReactionDto } from '../dtos/reaction.dto';
import { ReactionModel } from '../models/reaction.model';
import {
  ReactionCreatePayload, ReactionSearchRequestPayload
} from '../payloads';
import { REACT_MODEL_PROVIDER } from '../providers/reaction.provider';

@Injectable()
export class ReactionService {
  constructor(
    @Inject(forwardRef(() => VideoService))
    private readonly videoService: VideoService,
    @Inject(forwardRef(() => GalleryService))
    private readonly galleryService: GalleryService,
    @Inject(forwardRef(() => PhotoService))
    private readonly photoService: PhotoService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(REACT_MODEL_PROVIDER)
    private readonly reactionModel: Model<ReactionModel>,
    private readonly queueEventService: QueueEventService,
    private readonly userService: UserService,
    private readonly fileService: FileService
  ) {}

  public async findByQuery(payload) {
    return this.reactionModel.find(payload);
  }

  public async create(
    data: ReactionCreatePayload,
    user: UserDto
  ): Promise<ReactionDto> {
    const reaction = { ...data } as any;
    const existReact = await this.reactionModel.findOne({
      objectType: reaction.objectType,
      objectId: reaction.objectId,
      createdBy: user._id,
      action: reaction.action
    });
    if (existReact) {
      return existReact;
    }
    reaction.createdBy = user._id;
    reaction.createdAt = new Date();
    reaction.updatedAt = new Date();
    const newreaction = await this.reactionModel.create(reaction);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: REACTION_CHANNEL,
        eventName: EVENT.CREATED,
        data: new ReactionDto(newreaction)
      })
    );
    return newreaction;
  }

  public async remove(payload: ReactionCreatePayload, user: UserDto) {
    const reaction = await this.reactionModel.findOne({
      objectType: payload.objectType || REACTION_TYPE.VIDEO,
      objectId: payload.objectId,
      createdBy: user._id,
      action: payload.action
    });
    if (!reaction) {
      return false;
    }
    await reaction.remove();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: REACTION_CHANNEL,
        eventName: EVENT.DELETED,
        data: new ReactionDto(reaction)
      })
    );
    return true;
  }

  public async search(
    req: ReactionSearchRequestPayload
  ): Promise<PageableData<ReactionDto>> {
    const query = {} as any;
    if (req.objectId) {
      query.objectId = req.objectId;
    }
    const sort: Record<string, SortOrder> = {
      createdAt: -1
    };
    const [data, total] = await Promise.all([
      this.reactionModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.reactionModel.countDocuments(query)
    ]);
    const reactions = data.map((d) => new ReactionDto(d));
    const UIds = data.map((d) => d.createdBy);
    const [users, performers] = await Promise.all([
      UIds.length ? this.userService.findByIds(UIds) : [],
      UIds.length ? this.performerService.findByIds(UIds) : []
    ]);
    reactions.forEach((reaction: ReactionDto) => {
      const performer = performers.find(
        (p) => p._id.toString() === reaction.createdBy.toString()
      );
      const user = users.find(
        (u) => u._id.toString() === reaction.createdBy.toString()
      );
      // eslint-disable-next-line no-param-reassign
      reaction.creator = performer || user;
    });
    return {
      data: reactions,
      total
    };
  }

  public async getListVideo(req: ReactionSearchRequestPayload, user: UserDto) {
    const query = {
      objectType: REACTION_TYPE.VIDEO,
      createdBy: user._id
    } as any;
    if (req.action) query.action = req.action;

    const sort: Record<string, SortOrder> = {
      [req.sortBy || 'createdAt']: req.sort === 'desc' ? -1 : 1
    };
    const [items, total] = await Promise.all([
      this.reactionModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(req.limit || 10)
        .skip(req.offset || 0),
      this.reactionModel.countDocuments(query)
    ]);
    const videoIds = uniq(items.map((i) => i.objectId));
    const videos = videoIds.length > 0 ? await this.videoService.findByIds(videoIds) : [];
    const fileIds = [];
    videos.forEach((v) => {
      v.thumbnailId && fileIds.push(v.thumbnailId);
      v.fileId && fileIds.push(v.fileId);
      v.teaserId && fileIds.push(v.teaserId);
    });
    const files = await this.fileService.findByIds(fileIds);
    const reactions = items.map((v) => new ReactionDto(v));
    reactions.forEach((item) => {
      const video = videos.find((p) => `${p._id}` === `${item.objectId}`);
      if (video) {
        const vid = new VideoDto(video);
        if (vid.thumbnailId) {
          const thumbnail = files.find((f) => f._id.toString() === vid.thumbnailId.toString());
          if (thumbnail) {
            // eslint-disable-next-line no-param-reassign
            vid.thumbnail = thumbnail.getUrl();
          }
        }
        if (vid.fileId) {
          const mainVideoFile = files.find((f) => f._id.toString() === vid.fileId.toString());
          if (mainVideoFile) {
            // eslint-disable-next-line no-param-reassign
            vid.video = {
              url: null, // video.getUrl(),
              thumbnails: mainVideoFile.getThumbnails(),
              duration: mainVideoFile.duration
            };
          }
        }
        if (vid.teaserId) {
          const teaserFile = files.find((f) => f._id.toString() === vid.teaserId.toString());
          if (teaserFile) {
            // eslint-disable-next-line no-param-reassign
            vid.teaser = {
              url: teaserFile.getUrl(),
              thumbnails: teaserFile.getThumbnails(),
              duration: teaserFile.duration
            };
          }
        }
        // eslint-disable-next-line no-param-reassign
        item.objectInfo = vid;
      }
    });

    return {
      data: reactions,
      total
    };
  }

  public async getListGallery(req: ReactionSearchRequestPayload, user: UserDto) {
    const query = {
      objectType: REACTION_TYPE.GALLERY,
      createdBy: user._id
    } as any;
    if (req.action) query.action = req.action;

    const sort: Record<string, SortOrder> = {
      [req.sortBy || 'createdAt']: req.sort === 'desc' ? -1 : 1
    };
    const [items, total] = await Promise.all([
      this.reactionModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(req.limit || 10)
        .skip(req.offset || 0),
      this.reactionModel.countDocuments(query)
    ]);
    const galleryIds = uniq(items.map((i) => i.objectId));
    const galleries = galleryIds.length > 0 ? await this.galleryService.findByIds(galleryIds) : [];
    const photoIds = galleries.map((g) => g.coverPhotoId);
    const photos = photoIds.length > 0 ? await this.photoService.findByIds(photoIds) : [];
    const fileIds = photos.map((p) => p.fileId);
    const files = await this.fileService.findByIds(fileIds);
    const reactions = items.map((v) => new ReactionDto(v));
    reactions.forEach((item) => {
      const gallery = galleries.find((p) => `${p._id}` === `${item.objectId}`);
      if (gallery) {
        const dto = new GalleryDto(gallery);
        if (dto.coverPhotoId) {
          const photo = photos.find((f) => `${f._id}` === `${dto.coverPhotoId}`);
          const cover = photo && files.find((f) => `${f._id}` === `${photo.fileId}`);
          if (cover) {
            dto.coverPhoto = {
              url: cover.getUrl(),
              thumbnails: cover.getThumbnails()
            };
          }
        }
        // eslint-disable-next-line no-param-reassign
        item.objectInfo = dto;
      }
    });

    return {
      data: reactions,
      total
    };
  }

  public async checkExisting(objectId: string | ObjectId, userId: string | ObjectId, action: string, objectType: string) {
    return this.reactionModel.countDocuments({
      objectId, createdBy: userId, action, objectType
    });
  }
}
