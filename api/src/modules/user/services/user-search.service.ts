import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel/common';

import { IUserResponse, UserDto } from '../dtos';
import { UserModel } from '../models';
import { UserSearchRequestPayload } from '../payloads';
import { USER_MODEL_PROVIDER } from '../providers';

@Injectable()
export class UserSearchService {
  constructor(
    @Inject(USER_MODEL_PROVIDER)
    private readonly userModel: Model<UserModel>
  ) {}

  // TODO - should create new search service?
  public async search(
    req: UserSearchRequestPayload
  ): Promise<PageableData<IUserResponse>> {
    const query = {} as any;
    if (req.q) {
      const regexp = new RegExp(
        req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        'i'
      );
      query.$or = [
        {
          name: { $regex: regexp }
        },
        {
          username: { $regex: regexp }
        },
        {
          email: { $regex: regexp }
        }
      ];
    }
    if (req.role) {
      query.roles = { $in: [req.role] };
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
      this.userModel
        .find(query)
        .sort(sort)
        .limit(req.limit || 10)
        .skip(req.offset || 0),
      this.userModel.countDocuments(query)
    ]);
    return {
      data: data.map((item) => new UserDto(item).toResponse(true)),
      total
    };
  }

  public async searchByKeyword(
    req: UserSearchRequestPayload
  ): Promise<any> {
    const query = {} as any;
    if (req.q) {
      const regexp = new RegExp(
        req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
        'i'
      );
      query.$or = [
        {
          name: { $regex: regexp }
        },
        {
          email: { $regex: regexp }
        },
        {
          username: { $regex: regexp }
        }
      ];
    }

    const [data] = await Promise.all([
      this.userModel
        .find(query)
    ]);
    return data;
  }
}
