import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class CategoryModel extends Document {
  group: string;

  name: string;

  slug: string;

  description: string;

  status: string;

  ordering: number;

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
