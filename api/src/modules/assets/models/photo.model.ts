import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class PhotoModel extends Document {
  target: string;

  targetId: ObjectId;

  fileId: ObjectId;

  type: string;

  title: string;

  description: string;

  status: string;

  processing: boolean;

  isCover: boolean;

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
