import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class ReactionModel extends Document {
  objectId: ObjectId;

  action?: string;

  creator?: any;

  objectType?: string;

  createdBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
