import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { ConfigService } from 'nestjs-config';
import {
  EntityNotFoundException, StringHelper
} from 'src/kernel';
import { MailerService } from 'src/modules/mailer';
import { UserDto } from 'src/modules/user/dtos';
import { UserService } from 'src/modules/user/services';

import { AuthCreateDto, AuthUpdateDto } from '../dtos';
import { AuthErrorException } from '../exceptions';
import { AuthModel, ForgotModel, VerificationModel } from '../models';
import { AUTH_MODEL_PROVIDER, FORGOT_MODEL_PROVIDER, VERIFICATION_MODEL_PROVIDER } from '../providers/auth.provider';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(AUTH_MODEL_PROVIDER)
    private readonly authModel: Model<AuthModel>,
    @Inject(VERIFICATION_MODEL_PROVIDER)
    private readonly verificationModel: Model<VerificationModel>,
    @Inject(FORGOT_MODEL_PROVIDER)
    private readonly forgotModel: Model<ForgotModel>,
    private readonly mailService: MailerService,
    private readonly config: ConfigService
  ) { }

  /**
   * generate password salt
   * @param byteSize integer
   */
  public generateSalt(byteSize = 16): string {
    return crypto.randomBytes(byteSize).toString('base64');
  }

  public encryptPassword(pw: string, salt: string): string {
    const defaultIterations = 10000;
    const defaultKeyLength = 64;

    return crypto.pbkdf2Sync(pw, salt, defaultIterations, defaultKeyLength, 'sha1').toString('base64');
  }

  public async findOne(query: any) {
    const data = await this.authModel.findOne(query);
    return data;
  }

  public async find(query: any) {
    const data = await this.authModel.find(query);
    return data;
  }

  public async create(data: AuthCreateDto): Promise<AuthModel> {
    const salt = this.generateSalt();
    if (!data.value) {
      return null;
    }
    const newVal = this.encryptPassword(data.value, salt);
    let auth = await this.authModel.findOne({
      type: data.type,
      source: data.source,
      sourceId: data.sourceId
    });
    if (!auth) {
      // eslint-disable-next-line new-cap
      auth = new this.authModel({
        type: data.type,
        source: data.source,
        sourceId: data.sourceId
      });
    }

    auth.salt = salt;
    auth.value = newVal;
    auth.key = data.key;
    await auth.save();
    return auth;
  }

  public async update(data: AuthUpdateDto) {
    const user = await this.userService.findById(data.sourceId);
    if (!user) {
      throw new EntityNotFoundException();
    }
    await Promise.all([
      user.email && this.create({
        source: data.source,
        sourceId: user._id,
        type: 'email',
        key: user.email,
        value: data.value
      }),
      user.username && this.create({
        source: data.source,
        sourceId: user._id,
        type: 'username',
        key: user.username,
        value: data.value
      })
    ]);
  }

  public async updateKey(data: AuthUpdateDto) {
    const auths = await this.authModel.find({
      source: data.source,
      sourceId: data.sourceId
    });

    const user = await this.userService.findById(data.sourceId);
    if (!user) return;
    await Promise.all(
      auths.map((auth) => {
        // eslint-disable-next-line no-param-reassign
        auth.key = auth.type === 'email' ? user.email : user.username;
        return auth.save();
      })
    );
  }

  public async findBySource(options: {
    source?: string;
    sourceId?: ObjectId;
    type?: string;
    key?: string;
  }): Promise<AuthModel | null> {
    return this.authModel.findOne(options);
  }

  public verifyPassword(pw: string, auth: AuthModel): boolean {
    if (!pw || !auth || !auth.salt) {
      return false;
    }
    return this.encryptPassword(pw, auth.salt) === auth.value;
  }

  public generateJWT(auth: any, options: any = {}): string {
    const newOptions = {
      // 30d, in miliseconds
      expiresIn: 60 * 60 * 24 * 7,
      ...(options || {})
    };
    return jwt.sign(
      {
        authId: auth._id,
        source: auth.source,
        sourceId: auth.sourceId
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: newOptions.expiresIn
      }
    );
  }

  public verifyJWT(token: string) {
    try {
      return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (e) {
      return false;
    }
  }

  public async getSourceFromJWT(jwtToken: string): Promise<any> {
    // TODO - check and move to user service?
    const decodded = this.verifyJWT(jwtToken);
    if (!decodded) {
      throw new AuthErrorException();
    }

    // TODO - detect source and get data?
    // TODO - should cache here?
    if (decodded.source === 'user') {
      const user = await this.userService.findById(decodded.sourceId);

      // TODO - check activated status here
      return new UserDto(user).toResponse(true);
    }

    return null;
  }

  public async forgot(
    auth: AuthModel,
    source: {
      _id: ObjectId;
      email: string;
    }
  ) {
    const token = StringHelper.randomString(14);
    await this.forgotModel.create({
      token,
      source: auth.source,
      sourceId: source._id,
      authId: auth._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const forgotLink = new URL(
      `auth/password-change?token=${token}`,
      this.config.get('app.baseUrl')
    );
    await this.mailService.send({
      subject: 'Recover password',
      to: source.email,
      data: {
        forgotLink
      },
      template: 'forgot'
    });
    return true;
  }

  public async getForgot(token: string): Promise<ForgotModel> {
    return this.forgotModel.findOne({ token });
  }
}
