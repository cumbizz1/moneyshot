import { Inject, Injectable } from '@nestjs/common';
import { merge } from 'lodash';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import {
  EntityNotFoundException,
  StringHelper
} from 'src/kernel';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { UserDto } from 'src/modules/user/dtos';

import { CATEGORY_GROUPS } from '../constants';
import { CategoryModel } from '../models';
import { CategoryCreatePayload } from '../payloads/category-create.payload';
import { CategorySearchRequest } from '../payloads/category-search.request';
import { CategoryUpdatePayload } from '../payloads/category-update.payload';
import {
  CATEGORY_PROVIDER
} from '../providers';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_PROVIDER)
    private readonly categoryModel: Model<CategoryModel>
  ) {}

  public async findByIds(ids: string[] | ObjectId[]) {
    return this.categoryModel.find({ _id: { $in: ids } });
  }

  public async create(
    payload: CategoryCreatePayload,
    creator: UserDto
  ): Promise<any> {
    const data = {
      ...payload,
      createdBy: creator._id,
      updatedBy: creator._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    data.slug = StringHelper.createAlias(data.name);
    const slugCheck = await this.categoryModel.countDocuments({
      slug: data.slug
    });
    if (slugCheck) {
      data.slug = `${data.slug}-${StringHelper.randomString(8)}`;
    }
    return this.categoryModel.create(data);
  }

  public async update(
    id: string | ObjectId,
    payload: CategoryUpdatePayload,
    creator?: UserDto
  ): Promise<any> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new EntityNotFoundException('Category not found!');
    }
    let { slug } = category;
    if (payload.name !== category.name) {
      slug = StringHelper.createAlias(payload.name);
      const slugCheck = await this.categoryModel.countDocuments({
        slug,
        _id: { $ne: category._id }
      });
      if (slugCheck) {
        slug = `${slug}-${StringHelper.randomString(8)}`;
      }
    }
    merge(category, payload);
    category.slug = slug;
    category.updatedAt = new Date();
    if (creator) {
      category.updatedBy = creator._id;
    }

    return category.save();
  }

  public async findByIdOrAlias(id: string | ObjectId) {
    const query = !isObjectId(`${id}`) ? { slug: id } : { _id: id } as any;
    const category = await this.categoryModel.findOne(query);
    if (!category) {
      throw new EntityNotFoundException();
    }
    return category;
  }

  public async search(
    req: CategorySearchRequest
  ) {
    const query = {} as any;
    if (req.q) query.name = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
    if (req.status) query.status = req.status;
    if (req.group) {
      query.group = { $nin: CATEGORY_GROUPS.filter((c) => c !== req.group) };
    }
    let sort = {
      ordering: 1,
      updatedAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.categoryModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.categoryModel.countDocuments(query)
    ]);

    return {
      data,
      total
    };
  }

  public async delete(id: string | ObjectId) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new EntityNotFoundException();
    }
    await category.remove();
    return true;
  }
}
