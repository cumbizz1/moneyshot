import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ConfigService } from 'nestjs-config';
import { EntityNotFoundException, StringHelper } from 'src/kernel';
import { MailerService } from 'src/modules/mailer';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { UserDto } from 'src/modules/user/dtos';
import { UserModel } from 'src/modules/user/models';
import { UserService } from 'src/modules/user/services';

import { VerificationModel } from '../models';
import { VERIFICATION_MODEL_PROVIDER } from '../providers/auth.provider';

@Injectable()
export class VerificationService {
  constructor(
    @Inject(forwardRef(() => SettingService))
    private readonly settingService: SettingService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(VERIFICATION_MODEL_PROVIDER)
    private readonly verificationModel: Model<VerificationModel>,
    private readonly mailService: MailerService,
    private readonly config: ConfigService
  ) {}

  async sendVerificationEmail(source: UserModel | UserDto): Promise<void> {
    let verification = await this.verificationModel.findOne({
      sourceId: source._id,
      value: source.email
    });
    if (!verification) {
      // eslint-disable-next-line new-cap
      verification = new this.verificationModel();
    }
    const token = StringHelper.randomString(15);
    verification.set('sourceId', source._id);
    verification.set('sourceType', 'user');
    verification.set('value', source.email);
    verification.set('token', token);
    await verification.save();

    const apiBaseUrl = await this.settingService.getKeyValue(SETTING_KEYS.LINK_API_BASE_URL);

    const verificationLink = new URL(
      `auth/email-verification?token=${token}`,
      apiBaseUrl || this.config.get('app.baseUrl')
    );
    await this.mailService.send({
      to: source.email,
      subject: 'Verify your email address',
      data: {
        verificationLink
      },
      template: 'email-verification'
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const verification = await this.verificationModel.findOne({
      token
    });
    if (!verification) {
      throw new EntityNotFoundException();
    }
    verification.verified = true;
    await verification.save();
    verification.sourceType === 'user'
      && (await this.userService.updateVerificationStatus(verification.sourceId));
  }

  getEmailVerifiedMessage(): string {
    return 'Thank you. Your email has been verified. You can close and login to system now';
  }
}
