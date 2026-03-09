import { Inject, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel/common';

import { PERFORMER_STATUSES } from '../constants';
import { IPerformerResponse, PerformerDto } from '../dtos';
import { PerformerModel } from '../models';
import { PerformerSearchRequest } from '../payloads';
import { PERFORMER_MODEL_PROVIDER } from '../providers';

@Injectable()
export class PerformerSearchService {
  constructor(
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>
  ) { }

  public async adminSearch(
    req: PerformerSearchRequest
  ): Promise<PageableData<IPerformerResponse>> {
    const query = {} as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        { firstName: searchValue },
        { lastName: searchValue },
        { name: searchValue },
        { username: searchValue },
        { email: searchValue }
      ];
    }
    if (req.categoryId) {
      query.categoryIds = { $in: [req.categoryId] };
    }
    if (req.categoryIds && req.categoryIds.length) {
      query.categoryIds = Array.isArray(req.categoryIds) ? { $in: req.categoryIds } : { $in: [req.categoryIds] };
    }
    ['hair', 'pubicHair', 'ethnicity', 'country', 'bodyType', 'gender', 'status',
      'height', 'weight', 'eyes', 'butt', 'sexualOrientation'].forEach((f) => {
      if (req[f]) {
        query[f] = req[f];
      }
    });
    if (req.fromAge && req.toAge) {
      query.dateOfBirth = {
        $gte: new Date(req.fromAge),
        $lte: new Date(req.toAge)
      };
    }
    if (req.age) {
      const fromAge = req.age.split('_')[0];
      const toAge = req.age.split('_')[1];
      const fromDate = moment().subtract(toAge, 'years').startOf('day').toDate();
      const toDate = moment().subtract(fromAge, 'years').startOf('day').toDate();
      query.dateOfBirth = {
        $gte: fromDate,
        $lte: toDate
      };
    }
    let sort = {
      isOnline: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.performerModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.performerModel.countDocuments(query)
    ]);
    return {
      data: data.map((d) => new PerformerDto(d).toResponse(true)),
      total
    };
  }

  // TODO - should create new search service?
  public async search(
    req: PerformerSearchRequest
  ): Promise<PageableData<any>> {
    const query = {
      status: PERFORMER_STATUSES.ACTIVE
    } as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        { firstName: searchValue },
        { lastName: searchValue },
        { name: searchValue },
        { username: searchValue },
        { bio: searchValue }
      ];
    }
    if (req.categoryId) {
      query.categoryIds = { $in: [req.categoryId] };
    }
    if (req.categoryIds && req.categoryIds.length) {
      query.categoryIds = Array.isArray(req.categoryIds) ? { $in: req.categoryIds } : { $in: [req.categoryIds] };
    }
    ['hair', 'pubicHair', 'ethnicity', 'country', 'bodyType', 'gender', 'status',
      'height', 'weight', 'eyes', 'butt', 'sexualOrientation'].forEach((f) => {
      if (req[f]) {
        query[f] = req[f];
      }
    });
    if (req.fromAge && req.toAge) {
      query.dateOfBirth = {
        $gte: moment(req.fromAge).startOf('day').toDate(),
        $lte: moment(req.toAge).endOf('day').toDate()
      };
    }
    if (req.age) {
      const fromAge = req.age.split('_')[0];
      const toAge = req.age.split('_')[1];
      const fromDate = moment().subtract(toAge, 'years').startOf('day');
      const toDate = moment().subtract(fromAge, 'years').endOf('day');
      query.dateOfBirth = {
        $gte: fromDate,
        $lte: toDate
      };
    }
    let sort = {
      createdAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    if (req.sortBy === 'newest') {
      sort = '-createdAt';
    }
    if (req.sortBy === 'oldest') {
      sort = 'createdAt';
    }
    if (req.sortBy === 'popular') {
      sort = '-score';
    }
    const [data, total] = await Promise.all([
      this.performerModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.performerModel.countDocuments(query)
    ]);
    return {
      data: data.map((d) => new PerformerDto(d).toPublicDetailsResponse()),
      total
    };
  }

  public async searchByKeyword(
    req: PerformerSearchRequest
  ): Promise<any> {
    const query = {} as any;
    if (req.q) {
      const searchValue = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
      query.$or = [
        {
          name: searchValue
        },
        {
          username: searchValue
        }
      ];
    }
    const [data] = await Promise.all([
      this.performerModel
        .find(query)
        .lean()
    ]);
    return data;
  }
}
