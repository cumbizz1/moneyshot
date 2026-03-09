import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class BannerModel extends Document {
  fileId: ObjectId;

  title: string;

  description: string;

  status: string;

  link: string;

  position: string;

  processing: boolean;

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
