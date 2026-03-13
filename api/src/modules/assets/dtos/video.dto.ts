import { pick } from 'lodash';
import { ObjectId } from 'mongodb';
import { FileModel } from 'src/modules/file/models';

export class VideoDto {
  _id?: ObjectId;

  performerIds?: ObjectId[];

  categoryIds?: ObjectId[];

  categories?: any[];

  fileId?: ObjectId;

  title?: string;

  slug?: string;

  description?: string;

  status?: string;

  tags?: string[];

  teaserId?: ObjectId;

  teaser?: any;

  teaserProcessing?: boolean;

  processing?: boolean;

  thumbnailId?: ObjectId;

  isSale?: boolean;

  price?: number;

  isSchedule?: boolean;

  scheduledAt?: Date;

  thumbnail?: any;

  video?: any;

  performers?: any[];

  stats?: any;

  isLiked?: boolean;

  isFavourited?: boolean;

  isWatchedLater?: boolean;

  isBought?: boolean;

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(init?: any) {
    Object.assign(
      this,
      pick(init, [
        '_id',
        'performerIds',
        'categoryIds',
        'fileId',
        'title',
        'slug',
        'description',
        'status',
        'processing',
        'thumbnailId',
        'isSchedule',
        'scheduledAt',
        'isSale',
        'price',
        'video',
        'thumbnail',
        'performers',
        'tags',
        'stats',
        'teaserId',
        'teaser',
        'teaserProcessing',
        'isLiked',
        'isFavourited',
        'isWatchedLater',
        'isBought',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt'
      ])
    );
  }

  static fromModel(file: FileModel) {
    return new VideoDto(file);
  }
}
