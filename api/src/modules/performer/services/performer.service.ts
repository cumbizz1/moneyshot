/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import {
  EntityNotFoundException
} from 'src/kernel';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { CategoryService } from 'src/modules/category/services';
import { FileDto } from 'src/modules/file';
import { REF_TYPE } from 'src/modules/file/constants';
import { FileService } from 'src/modules/file/services';
import { UserDto } from 'src/modules/user/dtos';

import { PerformerDto } from '../dtos';
import {
  UsernameExistedException
} from '../exceptions';
import {
  PerformerModel
} from '../models';
import {
  PerformerCreatePayload,
  PerformerUpdatePayload
} from '../payloads';
import { PERFORMER_MODEL_PROVIDER } from '../providers';

@Injectable()
export class PerformerService {
  constructor(
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>,
    private readonly fileService: FileService
  ) {
  }

  public async findById(
    id: string | ObjectId
  ): Promise<PerformerDto> {
    const model = await this.performerModel.findById(id);
    if (!model) return null;
    return new PerformerDto(model);
  }

  public async findByUsername(
    username: string
  ): Promise<PerformerDto> {
    const query = isObjectId(username) ? { _id: username } : { username: username.toLowerCase() };
    const model = await this.performerModel.findOne(query);
    if (!model) return null;
    const dto = new PerformerDto(model);
    if (model.avatarId) {
      const avatar = await this.fileService.findById(model.avatarId);
      dto.avatarPath = avatar ? avatar.path : null;
    }
    if (model.coverId) {
      const cover = await this.fileService.findById(model.coverId);
      dto.coverPath = cover ? cover.path : null;
    }
    if (model.welcomeVideoId) {
      const welcomeVideo = await this.fileService.findById(model.welcomeVideoId);
      dto.welcomeVideoPath = welcomeVideo ? welcomeVideo.getUrl() : null;
    }
    await this.performerModel.updateOne(
      { _id: model._id },
      {
        $inc: { 'stats.views': 1 }
      }
    );
    return dto;
  }

  public async findByEmail(email: string): Promise<PerformerDto> {
    if (!email) {
      return null;
    }
    const model = await this.performerModel.findOne({
      email: email.toLowerCase()
    });
    if (!model) return null;
    return new PerformerDto(model);
  }

  public async findByIds(ids: any[]): Promise<PerformerDto[]> {
    const performers = await this.performerModel
      .find({
        _id: {
          $in: ids
        }
      })
      .lean()
      .exec();
    return performers.map((p) => new PerformerDto(p));
  }

  public async getDetails(id: string | ObjectId): Promise<PerformerDto> {
    const performer = await this.performerModel.findById(id);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    const [
      avatar,
      cover,
      welcomeVideo,
      categories
    ] = await Promise.all([
      performer.avatarId ? this.fileService.findById(performer.avatarId) : null,
      performer.coverId ? this.fileService.findById(performer.coverId) : null,
      performer.welcomeVideoId ? this.fileService.findById(performer.welcomeVideoId) : null,
      performer.categoryIds.length ? this.categoryService.findByIds(performer.categoryIds) : []
    ]);

    // TODO - update kernel for file dto
    const dto = new PerformerDto(performer);
    dto.avatar = avatar ? FileDto.getPublicUrl(avatar.path) : null; // TODO - get default avatar
    dto.cover = cover ? FileDto.getPublicUrl(cover.path) : null;
    dto.welcomeVideoPath = welcomeVideo ? FileDto.getPublicUrl(welcomeVideo.path) : null;
    dto.categories = categories;
    return dto;
  }

  public async create(
    payload: PerformerCreatePayload,
    user?: UserDto
  ): Promise<PerformerDto> {
    const data = {
      ...payload,
      updatedAt: new Date(),
      createdAt: new Date()
    } as any;
    const userNameCheck = await this.performerModel.countDocuments({
      username: payload.username.trim()
    });
    if (userNameCheck) {
      throw new UsernameExistedException();
    }

    if (payload.avatarId) {
      const avatar = await this.fileService.findById(payload.avatarId);
      if (!avatar) {
        throw new EntityNotFoundException('Avatar not found!');
      }
      // TODO - check for other storaged
      data.avatarPath = avatar.path;
    }

    if (payload.coverId) {
      const cover = await this.fileService.findById(payload.coverId);
      if (!cover) {
        throw new EntityNotFoundException('Cover not found!');
      }
      // TODO - check for other storaged
      data.coverPath = cover.path;
    }

    // TODO - check for category Id, studio
    if (user) {
      data.createdBy = user._id;
    }
    data.username = data.username.trim();
    data.email = data.email ? data.email.toLowerCase() : null;
    const performer = await this.performerModel.create(data);

    await Promise.all([
      payload.avatarId
        && this.fileService.addRef(payload.avatarId, {
          itemId: performer._id as any,
          itemType: REF_TYPE.PERFORMER
        }),
      payload.coverId
        && this.fileService.addRef(payload.coverId, {
          itemId: performer._id as any,
          itemType: REF_TYPE.PERFORMER
        })
    ]);

    return new PerformerDto(performer);
  }

  public async adminUpdate(
    id: string | ObjectId,
    payload: PerformerUpdatePayload
  ): Promise<any> {
    const performer = await this.performerModel.findById(id);
    if (!performer) {
      throw new EntityNotFoundException();
    }
    const data = { ...payload, updatedAt: new Date() } as any;
    if (!data.name) {
      data.name = [data.firstName || '', data.lastName || ''].join(' ');
    }
    if (data.username && data.username.trim() !== performer.username) {
      const usernameCheck = await this.performerModel.countDocuments({
        username: data.username.trim(),
        _id: { $ne: performer._id }
      });
      if (usernameCheck) {
        throw new UsernameExistedException();
      }
      data.username = data.username.trim();
    }

    if (
      (payload.avatarId && !performer.avatarId)
      || (performer.avatarId
        && payload.avatarId
        && payload.avatarId !== performer.avatarId.toString())
    ) {
      const avatar = await this.fileService.findById(payload.avatarId);
      if (!avatar) {
        throw new EntityNotFoundException('Avatar not found!');
      }
      // TODO - check for other storaged
      data.avatarPath = avatar.path;
    }

    if (payload.coverId && `${payload.coverId}` !== `${performer?.coverId}`) {
      const cover = await this.fileService.findById(payload.coverId);
      if (!cover) {
        throw new EntityNotFoundException('Cover not found!');
      }
      // TODO - check for other storaged
      data.coverPath = cover.path;
    }
    data.categoryIds = data.categoryIds || [];
    await this.performerModel.updateOne({ _id: id }, data);
    return { updated: true };
  }

  public async updateAvatar(user: PerformerDto, file: FileDto) {
    await this.performerModel.updateOne(
      { _id: user._id },
      {
        avatarId: file._id,
        avatarPath: file.path
      }
    );
    await this.fileService.addRef(file._id, {
      itemId: user._id,
      itemType: REF_TYPE.PERFORMER
    });

    // resend user info?
    // TODO - check others config for other storage
    return file;
  }

  public async updateCover(user: PerformerDto, file: FileDto) {
    await this.performerModel.updateOne(
      { _id: user._id },
      {
        coverId: file._id,
        coverPath: file.path
      }
    );
    await this.fileService.addRef(file._id, {
      itemId: user._id,
      itemType: REF_TYPE.PERFORMER
    });

    return file;
  }

  public async updateWelcomeVideo(user: PerformerDto, file: FileDto) {
    await this.performerModel.updateOne(
      { _id: user._id },
      {
        welcomeVideoId: file._id,
        welcomeVideoPath: file.path
      }
    );

    await this.fileService.addRef(file._id, {
      itemId: user._id,
      itemType: REF_TYPE.PERFORMER
    });

    return file;
  }

  public async updateLikeStat(performerId: string | ObjectId, num = 1) {
    return this.performerModel.updateOne(
      { _id: performerId },
      {
        $inc: { 'stats.likes': num }
      }
    );
  }
}
