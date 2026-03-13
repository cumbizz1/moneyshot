import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { EntityNotFoundException } from 'src/kernel';
import { STATUS } from 'src/kernel/constants';
import { isObjectId } from 'src/kernel/helpers/string.helper';
import { AuthService, VerificationService } from 'src/modules/auth';
import { FileDto } from 'src/modules/file';
import { SubscriptionService } from 'src/modules/subscription/services/subscription.service';

import { STATUS_ACTIVE } from '../constants';
import { IUserResponse, UserDto } from '../dtos';
import { EmailHasBeenTakenException } from '../exceptions';
import { UsernameExistedException } from '../exceptions/username-existed.exception';
import { UserModel } from '../models';
import {
  UserAuthCreatePayload,
  UserAuthUpdatePayload,
  UserCreatePayload,
  UserUpdatePayload
} from '../payloads';
import { USER_MODEL_PROVIDER } from '../providers';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
    @Inject(forwardRef(() => VerificationService))
    private readonly verificationService: VerificationService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(USER_MODEL_PROVIDER)
    private readonly userModel: Model<UserModel>
  ) {}

  public async find(params: any): Promise<UserModel[]> {
    return this.userModel.find(params);
  }

  public async findOne(params: any): Promise<UserModel> {
    return this.userModel.findOne(params);
  }

  public async findByEmail(email: string): Promise<UserModel | null> {
    if (!email) {
      return null;
    }
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  public async findById(id: string | ObjectId): Promise<UserModel> {
    return this.userModel.findById(id);
  }

  public async getMe(id: string): Promise<IUserResponse> {
    const user = isObjectId(id) && await this.userModel.findById(id);
    if (!user) throw new EntityNotFoundException();
    const subscription = await this.subscriptionService.findOne({
      userId: user._id,
      expiredAt: { $gt: new Date() }
    });
    const dto = new UserDto(user).toResponse(true);
    dto.isSubscribed = !!subscription;
    if (user.roles.includes('admin')) {
      dto.isSubscribed = true;
    }
    dto.memberShipExpiredAt = subscription ? subscription.expiredAt : new Date();
    return dto;
  }

  public async findByUsername(username: string): Promise<UserDto> {
    const newUsername = username.trim();
    const user = await this.userModel.findOne({ username: newUsername });
    return user ? new UserDto(user) : null;
  }

  public async findByIds(ids: any[]): Promise<UserDto[]> {
    const users = await this.userModel
      .find({ _id: { $in: ids } })
      .lean()
      .exec();
    return users.map((u) => new UserDto(u));
  }

  public async create(
    data: UserCreatePayload | UserAuthCreatePayload,
    options = {} as any
  ): Promise<UserModel> {
    if (!data || !data.email) {
      throw new EntityNotFoundException();
    }
    const count = await this.userModel.countDocuments({
      email: data.email.toLowerCase()
    });
    if (count) {
      throw new EmailHasBeenTakenException();
    }

    const username = await this.findByUsername(data.username);
    if (username) {
      throw new UsernameExistedException();
    }

    // eslint-disable-next-line new-cap
    const user = new this.userModel({ ...data });
    user.email = data.email.toLowerCase();
    user.username = data.username.trim();
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.roles = options.roles || ['user'];
    user.status = options.status || STATUS_ACTIVE;
    if (!user.name) {
      user.name = [user.firstName || '', user.lastName || ''].join(' ');
    }
    return user.save();
  }

  public async update(
    id: string | ObjectId,
    payload: UserUpdatePayload,
    user?: UserDto
  ): Promise<any> {
    const data = { ...payload, updatedAt: new Date() };
    // TODO - check roles here
    if (user && !user.roles.includes('admin')) {
      delete data.email;
      delete data.username;
    }
    if (!data.name) {
      data.name = [data.firstName || '', data.lastName || ''].join(' ');
    }
    return this.userModel.updateOne({ _id: id }, data);
  }

  public async updateAvatar(user: UserDto, file: FileDto) {
    await this.userModel.updateOne(
      { _id: user._id },
      {
        avatarId: file._id,
        avatarPath: file.path
      }
    );

    // resend user info?
    // TODO - check others config for other storage
    return file;
  }

  public async adminUpdate(
    id: string | ObjectId,
    payload: UserAuthUpdatePayload
  ): Promise<boolean> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new EntityNotFoundException();
    }

    const data = { ...payload };
    if (!data.name) {
      data.name = [data.firstName || '', data.lastName || ''].join(' ');
    }

    if (data.email && data.email.toLowerCase() !== user.email) {
      const emailCheck = await this.userModel.countDocuments({
        email: data.email.toLowerCase(),
        _id: {
          $ne: user._id
        }
      });
      if (emailCheck) {
        throw new EmailHasBeenTakenException();
      }
      data.email = data.email.toLowerCase();
    }

    if (data.username && data.username.trim() !== user.username) {
      const usernameCheck = await this.userModel.countDocuments({
        username: data.username.trim(),
        _id: { $ne: user._id }
      });
      if (usernameCheck) {
        throw new UsernameExistedException();
      }
      data.username = data.username.trim();
    }

    await this.userModel.updateOne({ _id: id }, data);
    // update auth key if username or email has changed

    if (data.email && data.email.toLowerCase() !== user.email) {
      await this.verificationService.sendVerificationEmail(user);
      await this.authService.updateKey({
        source: 'user',
        sourceId: user._id,
        type: 'email'
      });
    }
    // update auth key if username or email has changed
    if (data.username && data.username.trim() !== user.username) {
      await this.authService.updateKey({
        source: 'user',
        sourceId: user._id,
        type: 'username'
      });
    }
    return true;
  }

  public async updateVerificationStatus(
    userId: string | ObjectId
  ): Promise<any> {
    return this.userModel.updateOne(
      {
        _id: userId
      },
      { status: STATUS.ACTIVE, verifiedEmail: true }
    );
  }
}
