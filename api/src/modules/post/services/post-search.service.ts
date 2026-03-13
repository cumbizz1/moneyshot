import { Inject, Injectable } from '@nestjs/common';
import { Model, SortOrder } from 'mongoose';
import { PageableData } from 'src/kernel';
import { UserService } from 'src/modules/user/services';

import { PostModel } from '../models';
import { AdminSearch, UserSearch } from '../payloads';
import { POST_MODEL_PROVIDER } from '../providers';

@Injectable()
export class PostSearchService {
  constructor(
    @Inject(POST_MODEL_PROVIDER)
    private readonly postModel: Model<PostModel>,
    private userService: UserService
  ) {}

  // TODO - define post DTO
  public async adminSearch(req: AdminSearch): Promise<PageableData<PostModel>> {
    const query = {} as any;
    if (req.q) {
      query.$or = [
        {
          title: { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') }
        }
      ];
    }
    if (req.status) {
      query.status = req.status;
    }
    const sort: Record<string, SortOrder> = {
      [req.sortBy || 'updatedAt']: req.sort
    };
    const [data, total] = await Promise.all([
      this.postModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.postModel.countDocuments(query)
    ]);

    // if (data.length) {
    //   const authorIds = data.map((p) => p.authorId);
    //   if (authorIds.length) {
    //     const authors = await this.userService.findByIds(authorIds);
    //     // TODO - load users here
    //   }
    // }

    return {
      data, // TODO - define mdoel
      total
    };
  }

  public async userSearch(req: UserSearch): Promise<PageableData<PostModel>> {
    const query = {} as any;
    query.status = 'published';
    const sort: Record<string, SortOrder> = {
      [req.sortBy || 'updatedAt']: req.sort || -1
    };
    const [data, total] = await Promise.all([
      this.postModel
        .find(query)
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.postModel.countDocuments(query)
    ]);
    return {
      data, // TODO - define mdoel
      total
    };
  }
}
