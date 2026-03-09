import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model, SortOrder } from 'mongoose';
import { PageableData } from 'src/kernel';
import { FileService } from 'src/modules/file/services';
import { Storage } from 'src/modules/storage/contants';
import { SubscriptionService } from 'src/modules/subscription/services/subscription.service';
import { UserDto } from 'src/modules/user/dtos';

import { PhotoDto } from '../dtos';
import { PhotoModel } from '../models';
import { PhotoSearchRequest } from '../payloads';
import { PERFORMER_PHOTO_MODEL_PROVIDER } from '../providers';
import { GalleryService } from './gallery.service';
import { VideoService } from './video.service';

@Injectable()
export class PhotoSearchService {
  constructor(
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
    @Inject(PERFORMER_PHOTO_MODEL_PROVIDER)
    private readonly photoModel: Model<PhotoModel>,
    private readonly galleryService: GalleryService,
    private readonly videoService: VideoService,
    private readonly fileService: FileService
  ) { }

  public async adminSearch(req: PhotoSearchRequest, jwToken: string): Promise<PageableData<PhotoDto>> {
    const query = {} as any;
    if (req.q) query.title = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
    if (req.targetId) query.targetId = req.targetId;
    if (req.target) query.target = req.target;
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
      this.photoModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.photoModel.countDocuments(query)
    ]);
    const targetIds = data.map((d) => d.targetId);
    const fileIds = data.map((d) => d.fileId);
    const photos = data.map((v) => new PhotoDto(v));
    const [galleries, videos, files] = await Promise.all([
      targetIds.length ? this.galleryService.findByIds(targetIds) : [],
      targetIds.length ? this.videoService.findByIds(targetIds) : [],
      fileIds.length ? this.fileService.findByIds(fileIds) : []
    ]);
    photos.forEach((v) => {
      if (v.targetId) {
        if (v.target === 'gallery') {
          const targetInfo = galleries.find((p) => p._id.toString() === v.targetId.toString());
          // eslint-disable-next-line no-param-reassign
          if (targetInfo) v.targetInfo = targetInfo;
        }
        if (v.target === 'video') {
          const targetInfo = videos.find((p) => p._id.toString() === v.targetId.toString());
          // eslint-disable-next-line no-param-reassign
          if (targetInfo) v.targetInfo = targetInfo;
        }
      }

      const file = files.find((f) => f._id.toString() === v.fileId.toString());
      if (file) {
        let url = file.getUrl(true);
        if (file.server !== Storage.S3) {
          url = `${url}?photoId=${v._id}&token=${jwToken}`;
        }
        // eslint-disable-next-line no-param-reassign
        v.photo = {
          thumbnails: file.getThumbnails(),
          url,
          width: file.width,
          height: file.height,
          mimeType: file.mimeType,
          size: file.size
        };
      }
    });
    return {
      data: photos,
      total
    };
  }

  public async userSearch(req: PhotoSearchRequest, user: UserDto, jwToken: string): Promise<PageableData<PhotoDto>> {
    const query = {} as any;
    if (req.q) query.title = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
    if (req.targetId) query.targetId = req.targetId;
    if (req.target) query.target = req.target;
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
      this.photoModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.photoModel.countDocuments(query)
    ]);
    const targetIds = data.map((d) => d.targetId);
    const fileIds = data.map((d) => d.fileId);
    const photos = data.map((v) => new PhotoDto(v));
    const [galleries, videos, files, isSubscribed] = await Promise.all([
      targetIds.length ? this.galleryService.findByIds(targetIds) : [],
      targetIds.length ? this.videoService.findByIds(targetIds) : [],
      fileIds.length ? this.fileService.findByIds(fileIds) : [],
      user ? this.subscriptionService.checkSubscribed(user._id) : false
    ]);
    photos.forEach((v) => {
      if (v.targetId) {
        if (v.target === 'gallery') {
          const targetInfo = galleries.find((p) => p._id.toString() === v.targetId.toString());
          // eslint-disable-next-line no-param-reassign
          if (targetInfo) v.targetInfo = targetInfo;
        }
        if (v.target === 'video') {
          const targetInfo = videos.find((p) => p._id.toString() === v.targetId.toString());
          // eslint-disable-next-line no-param-reassign
          if (targetInfo) v.targetInfo = targetInfo;
        }
      }

      const file = files.find((f) => f._id.toString() === v.fileId.toString());
      if (file) {
        let url = file.getUrl(isSubscribed || (user && user.roles && user.roles.includes('admin')));
        if (file.server !== Storage.S3) {
          url = `${url}?photoId=${v._id}&token=${jwToken}`;
        }
        // eslint-disable-next-line no-param-reassign
        v.photo = {
          thumbnails: file.getThumbnails(),
          url,
          width: file.width,
          height: file.height,
          mimeType: file.mimeType,
          size: file.size
        };
      }
    });
    return {
      data: photos,
      total
    };
  }

  public async getModelPhotosWithGalleryCheck(req: PhotoSearchRequest, user: UserDto, jwToken: string) {
    const query = {
      status: 'active',
      processing: false
    } as any;
    const sort: Record<string, SortOrder> = {
      createdAt: -1
    };
    const [data, total] = await Promise.all([
      this.photoModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.photoModel.countDocuments(query)
    ]);

    const fileIds = data.map((d) => d.fileId);
    const photos = data.map((v) => new PhotoDto(v));
    const [files, isSubscribed] = await Promise.all([
      fileIds.length ? this.fileService.findByIds(fileIds) : [],
      user ? this.subscriptionService.checkSubscribed(user._id) : false
    ]);
    photos.forEach((v) => {
      const file = files.find((f) => f._id.toString() === v.fileId.toString());
      if (file) {
        let url = file.getUrl(isSubscribed || (user && user.roles && user.roles.includes('admin')));
        if (file.server !== Storage.S3) {
          url = `${url}?photoId=${v._id}&token=${jwToken}`;
        }
        // eslint-disable-next-line no-param-reassign
        v.photo = {
          thumbnails: file.getThumbnails(),
          url,
          width: file.width,
          height: file.height,
          mimeType: file.mimeType,
          size: file.size
        };
      }
    });

    return {
      data: photos,
      total
    };
  }
}
