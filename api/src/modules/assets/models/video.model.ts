import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class VideoModel extends Document {
  performerIds: ObjectId[];

  categoryIds: ObjectId[];

  fileId: ObjectId;

  title: string;

  slug: string;

  description: string;

  status: string;

  processing: boolean;

  teaserId: ObjectId;

  teaserProcessing: boolean;

  thumbnailId: ObjectId;

  isSale: boolean;

  isSchedule: boolean;

  price: number;

  tags?: string[];

  stats: {
    likes: number,
    favorites: number,
    wishlist: number,
    views: number,
  };

  createdBy: ObjectId;

  updatedBy: ObjectId;

  scheduledAt: Date;

  createdAt: Date;

  updatedAt: Date;
}
