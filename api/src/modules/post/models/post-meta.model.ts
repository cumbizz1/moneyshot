import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class PostMetaModel extends Document {
  postId?: ObjectId;

  key: any;

  value: string;

  createdAt?: Date;

  updatedAt?: Date;
}
