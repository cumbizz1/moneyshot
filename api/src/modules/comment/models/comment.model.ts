import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class CommentModel extends Document {
  objectId: ObjectId;

  content?: string;

  creator?: any;

  objectType?: string;

  createdBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;

  totalReply: number;

  totalLike: number;
}
