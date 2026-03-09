import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { STATUS } from 'src/kernel/constants';

import {
  GalleryModel, ProductModel, VideoModel
} from '../../assets/models';
import {
  PERFORMER_GALLERY_MODEL_PROVIDER,
  PERFORMER_PRODUCT_MODEL_PROVIDER, PERFORMER_VIDEO_MODEL_PROVIDER
} from '../../assets/providers';
import { PerformerModel } from '../../performer/models';
import { PERFORMER_MODEL_PROVIDER } from '../../performer/providers';
import { SearchPayload } from '../payloads';

@Injectable()
export class SearchService {
  constructor(
    @Inject(PERFORMER_GALLERY_MODEL_PROVIDER)
    private readonly galleryModel: Model<GalleryModel>,
    @Inject(PERFORMER_PRODUCT_MODEL_PROVIDER)
    private readonly productModel: Model<ProductModel>,
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    private readonly videoModel: Model<VideoModel>,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>
  ) { }

  public async countTotal(req: SearchPayload): Promise<any> {
    const videoQuery = {
      status: STATUS.ACTIVE
    } as any;
    const performerQuery = {
      status: STATUS.ACTIVE
    } as any;
    const galleryQuery = {
      status: STATUS.ACTIVE
    } as any;
    const productQuery = {
      status: STATUS.ACTIVE
    } as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, ''), 'i') };
      videoQuery.$or = [
        { title: searchValue },
        { tags: { $elemMatch: searchValue } },
        { description: searchValue }
      ];
      performerQuery.$or = [
        { firstName: searchValue },
        { lastName: searchValue },
        { name: searchValue },
        { username: searchValue },
        { bio: searchValue }
      ];
      galleryQuery.$or = [
        { name: searchValue },
        { description: searchValue }
      ];
      productQuery.$or = [
        { name: searchValue },
        { description: searchValue }
      ];
    }
    const [totalPerformers, totalVideos, totalGalleries, totalProducts] = await Promise.all([
      this.performerModel.countDocuments(performerQuery),
      this.videoModel.countDocuments(videoQuery),
      this.galleryModel.countDocuments(galleryQuery),
      this.productModel.countDocuments(productQuery)
    ]);

    return {
      totalPerformers, totalVideos, totalGalleries, totalProducts
    };
  }
}
