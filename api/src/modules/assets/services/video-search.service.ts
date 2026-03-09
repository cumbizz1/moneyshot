import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { STATUS } from 'src/kernel/constants';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { FileService } from 'src/modules/file/services';
import { ORDER_STATUS } from 'src/modules/payment/constants';
import { OrderService } from 'src/modules/payment/services';
import { PerformerDto } from 'src/modules/performer/dtos';
import { PerformerService } from 'src/modules/performer/services';
import { UserDto } from 'src/modules/user/dtos';

import { VideoDto } from '../dtos';
import { VideoModel } from '../models';
import { VideoSearchRequest } from '../payloads';
import { PERFORMER_VIDEO_MODEL_PROVIDER } from '../providers';

@Injectable()
export class VideoSearchService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    private readonly videoModel: Model<VideoModel>,
    private readonly fileService: FileService
  ) { }

  public async adminSearch(req: VideoSearchRequest): Promise<PageableData<VideoDto>> {
    const query = {} as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        { title: searchValue },
        { tags: { $elemMatch: searchValue } },
        { description: searchValue }
      ];
    }
    if (req.performerId) {
      query.performerIds = {
        $in: [req.performerId]
      };
    }
    if (req.performerIds && req.performerIds.length) {
      query.performerIds = {
        $in: req.performerIds
      };
    }
    if (req.categoryId) {
      query.categoryIds = { $in: [req.categoryId] };
    }
    if (req.categoryIds && req.categoryIds.length) {
      query.categoryIds = { $in: req.categoryIds };
    }
    if (req.status) query.status = req.status;
    if (req.isSale) query.isSale = req.isSale === 'true';
    if (req.isSchedule) query.isSchedule = req.isSchedule === 'true';
    let sort = {
      createdAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.videoModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit)
        .skip(req.offset),
      this.videoModel.countDocuments(query)
    ]);

    const performerIds = [];
    data.forEach((d) => {
      if (d.performerIds?.length) performerIds.push(...d.performerIds);
    });
    const fileIds = [];
    data.forEach((v) => {
      v.thumbnailId && fileIds.push(v.thumbnailId);
      v.fileId && fileIds.push(v.fileId);
      v.teaserId && fileIds.push(v.teaserId);
    });

    const [performers, files] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      fileIds.length ? this.fileService.findByIds(fileIds) : []
    ]);

    const videos = data.map((v) => new VideoDto(v));
    videos.forEach((v) => {
      const performerIdsString = v.performerIds?.map((id) => id.toString()) || [];
      const gPerformers = performers.filter(
        (p) => performerIdsString.includes(p._id.toString())
      );
      // eslint-disable-next-line no-param-reassign
      v.performers = gPerformers.map((p) => new PerformerDto(p).toSearchResponse());

      if (v.thumbnailId) {
        const thumbnail = files.find((f) => f._id.toString() === v.thumbnailId.toString());
        if (thumbnail) {
          // eslint-disable-next-line no-param-reassign
          v.thumbnail = {
            url: thumbnail.getUrl(),
            thumbnails: thumbnail.getThumbnails()
          };
        }
      }
      if (v.fileId) {
        const video = files.find((f) => f._id.toString() === v.fileId.toString());
        if (video) {
          // eslint-disable-next-line no-param-reassign
          v.video = {
            url: video.getUrl(),
            thumbnails: video.getThumbnails(),
            duration: video.duration
          };
        }
      }
      if (v.teaserId) {
        const teaser = files.find((f) => f._id.toString() === v.teaserId.toString());
        if (teaser) {
          // eslint-disable-next-line no-param-reassign
          v.teaser = {
            url: teaser.getUrl(),
            thumbnails: teaser.getThumbnails(),
            duration: teaser.duration
          };
        }
      }
    });

    return {
      data: videos,
      total
    };
  }

  public async userSearch(req: VideoSearchRequest, user: UserDto): Promise<PageableData<VideoDto>> {
    const query = {
      status: STATUS.ACTIVE
    } as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        { title: searchValue },
        { tags: { $elemMatch: searchValue } },
        { description: searchValue }
      ];
    }
    if (req.performerId) query.performerIds = { $in: [req.performerId] };
    if (req.performerIds && req.performerIds.length) query.performerIds = { $in: req.performerIds };
    if (req.categoryId) {
      query.categoryIds = { $in: [req.categoryId] };
    }
    if (req.categoryIds && req.categoryIds.length) {
      query.categoryIds = { $in: req.categoryIds };
    }
    if (req.isSale) query.isSale = req.isSale === 'true';
    if (req.isSchedule) query.isSchedule = req.isSchedule === 'true';
    if (req.excludedId) {
      if (isObjectId(req.excludedId)) {
        query._id = { $ne: req.excludedId };
      } else {
        query.slug = { $ne: req.excludedId };
      }
    }
    let sort = {
      createdAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    if (req.sortBy === 'popular') {
      sort = {
        'stats.likes': -1, 'stats.favourites': -1, 'stats.wishlist': -1, 'stats.comments': -1, 'stats.views': -1
      };
    }
    if (req.sortBy === 'newest') {
      sort = { createdAt: -1 };
    }
    if (req.sortBy === 'oldest') {
      sort = { createdAt: 1 };
    }
    const [data, total] = await Promise.all([
      this.videoModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit)
        .skip(req.offset),
      this.videoModel.countDocuments(query)
    ]);
    const performerIds = [];
    const fileIds = [];
    const videoIds = [];
    data.forEach((v) => {
      v.thumbnailId && fileIds.push(v.thumbnailId);
      v.fileId && fileIds.push(v.fileId);
      v.teaserId && fileIds.push(v.teaserId);
      v.performerIds?.length && performerIds.push(...v.performerIds);
      videoIds.push(v._id);
    });

    const [performers, files, orders] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      fileIds.length ? this.fileService.findByIds(fileIds) : [],
      user ? this.orderService.findOrderDetailsByQuery({ productId: { $in: videoIds }, buyerId: user._id, status: ORDER_STATUS.PAID }) : []
    ]);

    const videos = data.map((v) => new VideoDto(v));
    videos.forEach((v) => {
      const performerIdsString = v.performerIds?.map((id) => id.toString()) || [];
      const gPerformers = performers.filter(
        (p) => performerIdsString.includes(p._id.toString())
      );
      // eslint-disable-next-line no-param-reassign
      v.performers = gPerformers.map((p) => new PerformerDto(p).toSearchResponse());
      // check login & subscriber filter data
      if (v.thumbnailId) {
        const thumbnail = files.find((f) => f._id.toString() === v.thumbnailId.toString());
        if (thumbnail) {
          // eslint-disable-next-line no-param-reassign
          v.thumbnail = {
            url: thumbnail.getUrl(),
            thumbnails: thumbnail.getThumbnails()
          };
        }
      }
      if (v.fileId) {
        const video = files.find((f) => f._id.toString() === v.fileId.toString());
        if (video) {
          // eslint-disable-next-line no-param-reassign
          v.video = {
            url: null,
            thumbnails: video.getThumbnails(),
            duration: video.duration
          };
        }
      }
      if (v.teaserId) {
        const teaser = files.find((f) => f._id.toString() === v.teaserId.toString());
        if (teaser) {
          // eslint-disable-next-line no-param-reassign
          v.teaser = {
            url: teaser.getUrl(),
            thumbnails: teaser.getThumbnails(),
            duration: teaser.duration
          };
        }
      }
      const order = orders.find((o) => `${o.productId}` === `${v._id}`);
      // eslint-disable-next-line no-param-reassign
      v.isBought = !!order;
    });

    return {
      data: videos,
      total
    };
  }
}
