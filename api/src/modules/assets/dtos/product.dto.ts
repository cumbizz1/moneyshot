import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export class ProductDto {
  _id?: ObjectId;

  digitalFileId?: ObjectId;

  imageIds?: ObjectId[];

  images?: any;

  type?: string;

  name?: string;

  slug?: string;

  description?: string;

  status?: string;

  stats?: any;

  price?: number;

  stock?: number;

  categoryIds: ObjectId[];

  categories: any[];

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(init?: any) {
    Object.assign(
      this,
      pick(init, [
        '_id',
        'digitalFileId',
        'imageIds',
        'images',
        'type',
        'name',
        'slug',
        'description',
        'status',
        'stats',
        'price',
        'stock',
        'categories',
        'categoryIds',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt'
      ])
    );
  }

  toPublic() {
    return pick(this, [
      '_id',
      'imageIds',
      'images',
      'type',
      'name',
      'slug',
      'description',
      'status',
      'price',
      'stock',
      'stats',
      'categories',
      'categoryIds',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt'
    ]);
  }
}
