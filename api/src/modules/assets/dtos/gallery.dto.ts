import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

import { GalleryModel } from '../models';

export class GalleryDto {
  _id?: ObjectId;

  performerIds?: ObjectId[];

  categoryIds?: ObjectId[];

  categories?: any[];

  type?: string;

  name?: string;

  slug?: string;

  description?: string;

  status?: string;

  processing?: boolean;

  coverPhotoId?: ObjectId;

  isSale?: boolean;

  price?: number;

  numOfItems?: number;

  coverPhoto?: Record<string, any>;

  stats?: any;

  performers?: any;

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  isFavourited?: boolean;

  isLiked?: boolean;

  constructor(init?: any) {
    Object.assign(
      this,
      pick(init, [
        '_id',
        'performerIds',
        'categoryIds',
        'categories',
        'type',
        'name',
        'slug',
        'description',
        'status',
        'coverPhotoId',
        'numOfItems',
        'stats',
        'isSale',
        'price',
        'coverPhoto',
        'performers',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt',
        'isFavourited',
        'isLiked'
      ])
    );
  }

  static fromModel(model: GalleryModel) {
    return new GalleryDto(model);
  }
}
