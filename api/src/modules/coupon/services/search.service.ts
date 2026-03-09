import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';

import { CouponDto } from '../dtos';
import { CouponModel } from '../models';
import { CouponSearchRequestPayload } from '../payloads';
import { COUPON_PROVIDER } from '../providers';

@Injectable()
export class CouponSearchService {
  constructor(
    @Inject(COUPON_PROVIDER)
    private readonly couponModel: Model<CouponModel>
  ) {}

  // TODO - define category DTO
  public async search(
    req: CouponSearchRequestPayload
  ): Promise<PageableData<CouponDto>> {
    const query = {} as any;
    if (req.q) {
      query.$or = [
        {
          name: { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') }
        },
        {
          code: { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') }
        }
      ];
    }
    if (req.status) {
      query.status = req.status;
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
      this.couponModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.couponModel.countDocuments(query)
    ]);

    return {
      data: data.map((item) => new CouponDto(item)), // TODO - define mdoel
      total
    };
  }
}
