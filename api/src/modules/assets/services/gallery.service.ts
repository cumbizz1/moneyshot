import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { merge } from 'lodash';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import {
  EntityNotFoundException, PageableData, QueueEvent, QueueEventService, StringHelper
} from 'src/kernel';
import { EVENT, STATUS } from 'src/kernel/constants';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { CategoryService } from 'src/modules/category/services';
import { FileService } from 'src/modules/file/services';
import { PerformerDto } from 'src/modules/performer/dtos';
import { PerformerService } from 'src/modules/performer/services';
import { REACTION } from 'src/modules/reaction/constants';
import { ReactionService } from 'src/modules/reaction/services/reaction.service';
import { UserDto } from 'src/modules/user/dtos';

import { GalleryDto } from '../dtos';
import { GalleryModel, PhotoModel } from '../models';
import { GalleryCreatePayload, GallerySearchRequest } from '../payloads';
import { GalleryUpdatePayload } from '../payloads/gallery-update.payload';
import {
  PERFORMER_GALLERY_MODEL_PROVIDER,
  PERFORMER_PHOTO_MODEL_PROVIDER
} from '../providers';
import { PhotoService } from './photo.service';

export const PERFORMER_GALLERY_CHANNEL = 'PERFORMER_GALLERY_CHANNEL';

@Injectable()
export class GalleryService {
  constructor(
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => PhotoService))
    private readonly photoService: PhotoService,
    @Inject(forwardRef(() => ReactionService))
    private readonly reactionService: ReactionService,
    @Inject(PERFORMER_GALLERY_MODEL_PROVIDER)
    private readonly galleryModel: Model<GalleryModel>,
    @Inject(PERFORMER_PHOTO_MODEL_PROVIDER)
    private readonly photoModel: Model<PhotoModel>,
    private readonly fileService: FileService,
    private readonly queueEventService: QueueEventService
  ) {}

  public async create(
    payload: GalleryCreatePayload,
    creator: UserDto
  ): Promise<GalleryDto> {
    // eslint-disable-next-line new-cap
    const model = new this.galleryModel(payload);
    model.createdAt = new Date();
    model.updatedAt = new Date();
    if (creator) {
      model.createdBy = creator._id;
      model.updatedBy = creator._id;
    }
    model.slug = StringHelper.createAlias(payload.name);
    const slugCheck = await this.galleryModel.countDocuments({
      slug: model.slug
    });
    if (slugCheck) {
      model.slug = `${model.slug}-${StringHelper.randomString(8)}`;
    }
    await model.save();
    // update performer stats
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_GALLERY_CHANNEL,
        eventName: EVENT.CREATED,
        data: {
          ...new GalleryDto(model)
        }
      })
    );
    return new GalleryDto(model);
  }

  public async update(
    id: string | ObjectId,
    payload: GalleryUpdatePayload,
    creator?: UserDto
  ): Promise<GalleryDto> {
    const gallery = await this.galleryModel.findById(id);
    if (!gallery) {
      throw new EntityNotFoundException('Gallery not found!');
    }
    let { slug } = gallery;
    if (payload.name !== gallery.name) {
      slug = StringHelper.createAlias(payload.name);
      const slugCheck = await this.galleryModel.countDocuments({
        slug,
        _id: { $ne: gallery._id }
      });
      if (slugCheck) {
        slug = `${slug}-${StringHelper.randomString(8)}`;
      }
    }
    merge(gallery, payload);
    gallery.slug = slug;
    gallery.performerIds = payload.performerIds || [];
    gallery.categoryIds = payload.categoryIds || [];
    gallery.updatedAt = new Date();
    if (creator) {
      gallery.updatedBy = creator._id;
    }
    const oldStatus = gallery.status;
    await gallery.save();
    // update performer stats
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_GALLERY_CHANNEL,
        eventName: EVENT.UPDATED,
        data: {
          ...new GalleryDto(gallery),
          oldStatus
        }
      })
    );
    return GalleryDto.fromModel(gallery);
  }

  public async findByIds(ids: string[] | ObjectId[]): Promise<GalleryDto[]> {
    const galleries = await this.galleryModel.find({
      _id: {
        $in: ids
      }
    });

    return galleries.map((g) => new GalleryDto(g));
  }

  public async findById(id: string | ObjectId): Promise<GalleryDto> {
    const gallery = await this.galleryModel.findOne({ _id: id });
    if (!gallery) {
      throw new EntityNotFoundException();
    }
    return new GalleryDto(gallery);
  }

  public async adminDetails(id: string | ObjectId) {
    const query = !isObjectId(`${id}`) ? { slug: id } : { _id: id } as any;
    const gallery = await this.galleryModel.findOne(query);
    if (!gallery) {
      throw new EntityNotFoundException();
    }

    const dto = new GalleryDto(gallery);
    if (gallery.performerIds && gallery.performerIds.length) {
      const performers = await this.performerService.findByIds(gallery.performerIds);
      dto.performers = performers.map((p) => new PerformerDto(p).toPublicDetailsResponse());
    }
    if (gallery.categoryIds && gallery.categoryIds.length) {
      const categories = await this.categoryService.findByIds(gallery.categoryIds);
      dto.categories = categories;
    }

    return dto;
  }

  public async userDetails(id: string | ObjectId, user: UserDto) {
    const query = !isObjectId(`${id}`) ? { slug: id } : { _id: id } as any;
    const gallery = await this.galleryModel.findOne(query);
    if (!gallery) {
      throw new EntityNotFoundException();
    }

    const dto = new GalleryDto(gallery);
    if (gallery.performerIds && gallery.performerIds.length) {
      const performers = await this.performerService.findByIds(gallery.performerIds);
      dto.performers = performers.map((p) => new PerformerDto(p).toPublicDetailsResponse());
    }
    if (gallery.categoryIds && gallery.categoryIds.length) {
      const categories = await this.categoryService.findByIds(gallery.categoryIds);
      dto.categories = categories;
    }
    if (user) {
      const reactions = await this.reactionService.findByQuery({ objectId: gallery._id, createdBy: user._id });
      dto.isFavourited = !!reactions.filter((r) => r.action === REACTION.FAVOURITE).length;
      dto.isLiked = !!reactions.filter((r) => r.action === REACTION.LIKE).length;
    }
    await this.handleUpdateStats(dto._id, 'stats.views', 1);
    return dto;
  }

  public async adminSearch(
    req: GallerySearchRequest
  ): Promise<PageableData<GalleryDto>> {
    const query = {} as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        { name: searchValue },
        { description: searchValue }
      ];
    }
    if (req.performerId) query.performerIds = { $in: [req.performerId] };
    if (req.performerIds && req.performerIds.length) {
      query.performerIds = Array.isArray(req.performerIds) ? { $in: req.performerIds } : { $in: [req.performerIds] };
    }
    if (req.categoryId) {
      query.categoryIds = { $in: [req.categoryId] };
    }
    if (req.categoryIds && req.categoryIds.length) {
      query.categoryIds = Array.isArray(req.categoryIds) ? { $in: req.categoryIds } : { $in: [req.categoryIds] };
    }
    if (req.status) query.status = req.status;
    let sort = {
      createdAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.galleryModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.galleryModel.countDocuments(query)
    ]);

    const performerIds = [];
    data.forEach((d) => {
      if (d.performerIds?.length) performerIds.push(...d.performerIds);
    });
    const galleries = data.map((g) => new GalleryDto(g));
    const coverPhotoIds = data.map((d) => d.coverPhotoId);

    const [performers, coverPhotos] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      coverPhotoIds.length
        ? this.photoModel
          .find({ _id: { $in: coverPhotoIds } })
          .lean()
          .exec()
        : []
    ]);
    const fileIds = coverPhotos.map((c) => c.fileId);
    const files = await this.fileService.findByIds(fileIds);

    galleries.forEach((g) => {
      const performerIdsString = g.performerIds?.map((id) => id.toString()) || [];
      const gPerformers = performers.filter(
        (p) => performerIdsString.includes(p._id.toString())
      );
      // eslint-disable-next-line no-param-reassign
      g.performers = gPerformers.map((p) => new PerformerDto(p).toPublicDetailsResponse());
      if (g.coverPhotoId) {
        const coverPhoto = coverPhotos.find(
          (c) => c._id.toString() === g.coverPhotoId.toString()
        );
        if (coverPhoto) {
          const file = files.find(
            (f) => f._id.toString() === coverPhoto.fileId.toString()
          );
          if (file) {
            // eslint-disable-next-line no-param-reassign
            g.coverPhoto = {
              url: file.getUrl(),
              thumbnails: file.getThumbnails()
            };
          }
        }
      }
    });

    return {
      data: galleries,
      total
    };
  }

  public async userSearch(
    req: GallerySearchRequest,
    jwToken: string
  ): Promise<PageableData<GalleryDto>> {
    const query = {
      status: STATUS.ACTIVE,
      numOfItems: { $gt: 0 }
    } as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        { name: searchValue },
        { description: searchValue }
      ];
    }
    if (req.excludedId) query._id = { $ne: req.excludedId };
    if (req.performerId) query.performerIds = { $in: [req.performerId] };
    if (req.performerIds && req.performerIds.length) query.performerIds = { $in: req.performerIds };
    if (req.categoryId) {
      query.categoryIds = { $in: [req.categoryId] };
    }
    if (req.categoryIds && req.categoryIds.length) {
      query.categoryIds = { $in: req.categoryIds };
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
      this.galleryModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.galleryModel.countDocuments(query)
    ]);

    const performerIds = [];
    data.forEach((d) => {
      if (d.performerIds?.length) performerIds.push(...d.performerIds);
    });
    const galleries = data.map((g) => new GalleryDto(g));
    const coverPhotoIds = data.map((d) => d.coverPhotoId);

    const [performers, coverPhotos] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      coverPhotoIds.length
        ? this.photoModel
          .find({ _id: { $in: coverPhotoIds } })
          .lean()
          .exec()
        : []
    ]);
    const fileIds = coverPhotos.map((c) => c.fileId);
    const files = await this.fileService.findByIds(fileIds);

    galleries.forEach((g) => {
      const performerIdsString = g.performerIds?.map((id) => id.toString()) || [];
      const gPerformers = performers.filter(
        (p) => performerIdsString.includes(p._id.toString())
      );
      // eslint-disable-next-line no-param-reassign
      g.performers = gPerformers.map((p) => new PerformerDto(p).toPublicDetailsResponse());
      if (g.coverPhotoId) {
        const coverPhoto = coverPhotos.find(
          (c) => c._id.toString() === g.coverPhotoId.toString()
        );
        if (coverPhoto) {
          const file = files.find(
            (f) => f._id.toString() === coverPhoto.fileId.toString()
          );
          if (file) {
            const url = file.getUrl();
            // eslint-disable-next-line no-param-reassign
            g.coverPhoto = {
              url: jwToken ? `${url}?photoId=${coverPhoto._id}&token=${jwToken}` : url,
              thumbnails: file.getThumbnails()
            };
          }
        }
      }
    });

    return {
      data: galleries,
      total
    };
  }

  public async updateCover(
    galleryId: string | ObjectId,
    photoId: ObjectId
  ): Promise<boolean> {
    await this.galleryModel.updateOne(
      { _id: galleryId },
      {
        coverPhotoId: photoId
      }
    );
    return true;
  }

  public async updatePhotoStats(id: string | ObjectId, num = 1) {
    return this.galleryModel.updateOne(
      { _id: id },
      {
        $inc: { numOfItems: num }
      }
    );
  }

  public async delete(id: string | ObjectId) {
    const gallery = await this.galleryModel.findById(id);
    if (!gallery) {
      throw new EntityNotFoundException();
    }
    await gallery.remove();
    await this.photoService.deleteByGallery(gallery._id);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_GALLERY_CHANNEL,
        eventName: EVENT.DELETED,
        data: new GalleryDto(gallery)
      })
    );
    return true;
  }

  public async handleUpdateStats(id: string | ObjectId, type: string, num = 1) {
    return this.galleryModel.updateOne(
      { _id: id },
      {
        $inc: { [type]: num }
      }
    );
  }
}
