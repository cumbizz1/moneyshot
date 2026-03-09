import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { flatMap } from 'lodash';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { STATUS } from 'src/kernel/constants';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { CategoryService } from 'src/modules/category/services';
import { FileService } from 'src/modules/file/services';

import { ProductDto } from '../dtos';
import { ProductModel } from '../models';
import { ProductSearchRequest } from '../payloads';
import { PERFORMER_PRODUCT_MODEL_PROVIDER } from '../providers';

@Injectable()
export class ProductSearchService {
  constructor(
    @Inject(forwardRef(() => CategoryService))
  private readonly categoryService: CategoryService,
    @Inject(PERFORMER_PRODUCT_MODEL_PROVIDER)
    private readonly productModel: Model<ProductModel>,
    private readonly fileService: FileService
  ) {}

  public async adminSearch(
    req: ProductSearchRequest
  ): Promise<PageableData<ProductDto>> {
    const query = {} as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        { name: searchValue },
        { description: searchValue }
      ];
    }
    if (req.type) {
      query.type = req.type;
    }
    if (req.status) query.status = req.status;
    if (req.performerId) query.performerIds = { $in: [req.performerId] };
    if (req.performerIds && req.performerIds.length) query.performerIds = { $in: req.performerIds };
    if (req.categoryId) {
      query.categoryIds = { $in: [req.categoryId] };
    }
    if (req.categoryIds && req.categoryIds.length) {
      query.categoryIds = { $in: req.categoryIds };
    }
    let sort = {
      createdAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.productModel.countDocuments(query)
    ]);

    const imageIds = flatMap(data, (d) => d.imageIds);
    const products = data.map((v) => new ProductDto(v));
    const images = imageIds.length ? await this.fileService.findByIds(imageIds) : [];
    const categoryIds = [];
    data.forEach((p) => categoryIds.push(...(p.categoryIds || [])));
    const categories = categoryIds.length ? await this.categoryService.findByIds(categoryIds) : [];
    products.forEach((v) => {
      const stringImageIds = v.imageIds?.map((p) => p.toString()) || [];
      const files = images.filter((file) => stringImageIds.includes(file._id.toString()));
      // TODO - get default image for dto?
      if (files) {
        // eslint-disable-next-line no-param-reassign
        v.images = files.length ? files.map((f) => ({
          ...f,
          url: f.getUrl(),
          thumbnails: f.getThumbnails()
        })) : [];
      }

      const stringCategoryIds = v.categoryIds?.map((p) => p.toString()) || [];
      // eslint-disable-next-line no-param-reassign
      v.categories = categories.filter((c) => stringCategoryIds.includes(c._id.toString()));
    });

    return {
      data: products,
      total
    };
  }

  public async userSearch(
    req: ProductSearchRequest
  ): Promise<PageableData<ProductDto>> {
    const query = {
      status: STATUS.ACTIVE
    } as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        { name: searchValue },
        { description: searchValue }
      ];
    }
    if (req.type) {
      query.type = req.type;
    }
    if (req.excludedId) {
      if (isObjectId(req.excludedId)) {
        query._id = { $ne: req.excludedId };
      } else {
        query.slug = { $ne: req.excludedId };
      }
    }
    if (req.includedIds && req.includedIds.length > 0) {
      query._id = { $in: req.includedIds };
    }
    if (req.performerId) query.performerIds = { $in: [req.performerId] };
    if (req.performerIds && req.performerIds.length) {
      query.performerIds = Array.isArray(req.performerIds) ? { $in: req.performerIds } : { $in: [req.performerIds] };
    }
    if (req.categoryId) {
      query.categoryIds = { $in: [req.categoryId] };
    }
    if (req.categoryIds && req.categoryIds.length) {
      query.categoryIds = Array.isArray(req.categoryIds) ? { $in: req.categoryIds } : { $in: [req.categoryIds] };
    }
    let sort = {
      createdAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.productModel.countDocuments(query)
    ]);

    const imageIds = flatMap(data, (d) => d.imageIds);
    const products = data.map((v) => new ProductDto(v));
    const [images] = await Promise.all([
      imageIds.length ? this.fileService.findByIds(imageIds) : []
    ]);
    const categoryIds = [];
    data.forEach((p) => categoryIds.push(...(p.categoryIds || [])));
    const categories = categoryIds.length ? await this.categoryService.findByIds(categoryIds) : [];
    products.forEach((v) => {
      const stringImageIds = v.imageIds?.map((p) => p.toString()) || [];
      const files = images.filter((file) => stringImageIds.includes(file._id.toString()));
      // TODO - get default image for dto?
      if (files) {
        // eslint-disable-next-line no-param-reassign
        v.images = files.length ? files.map((f) => ({
          ...f,
          url: f.getUrl(),
          thumbnails: f.getThumbnails()
        })) : [];
      }

      const stringCategoryIds = v.categoryIds?.map((p) => p.toString()) || [];
      // eslint-disable-next-line no-param-reassign
      v.categories = categories.filter((c) => stringCategoryIds.includes(c._id.toString()));
    });

    return {
      data: products,
      total
    };
  }
}
