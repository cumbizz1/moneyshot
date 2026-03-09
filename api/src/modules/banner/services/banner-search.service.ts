import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { FileService } from 'src/modules/file/services';

import { BannerDto } from '../dtos';
import { BannerModel } from '../models';
import { BannerSearchRequest } from '../payloads';
import { BANNER_PROVIDER } from '../providers';

@Injectable()
export class BannerSearchService {
  constructor(
    @Inject(BANNER_PROVIDER)
    private readonly bannerModel: Model<BannerModel>,
    private readonly fileService: FileService
  ) {}

  public async search(
    req: BannerSearchRequest
  ): Promise<PageableData<BannerDto>> {
    const query = {} as any;
    if (req.q) query.title = { $regex: new RegExp(req.q.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''), 'i') };
    if (req.status) query.status = req.status;
    let sort = {
      createdAt: -1
    } as any;
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.bannerModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? req.limit || 10 : 10)
        .skip(req.offset || 0),
      this.bannerModel.countDocuments(query)
    ]);

    const fileIds = data.map((d) => d.fileId);
    const banners = data.map((v) => new BannerDto(v));
    const [files] = await Promise.all([
      fileIds.length ? this.fileService.findByIds(fileIds) : []
    ]);
    banners.forEach((v) => {
      // TODO - should get picture (thumbnail if have?)
      const file = files.find((f) => f._id.toString() === v.fileId.toString());
      if (file) {
        // eslint-disable-next-line no-param-reassign
        v.photo = {
          thumbnails: file.getThumbnails(),
          url: file.getUrl(),
          width: file.width,
          height: file.height,
          mimeType: file.mimeType
        };
      }
    });

    return {
      data: banners,
      total
    };
  }
}
