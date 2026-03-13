import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class ProductModel extends Document {
  digitalFileId: ObjectId;

  imageIds: ObjectId[];

  type: string;

  name: string;

  slug: string;

  description: string;

  status: string;

  price: number;

  stock: number;

  stats: {
    views: number;
    favourites: number;
    wishlist: number;
    comments: number;
  };

  categoryIds: ObjectId[];

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
