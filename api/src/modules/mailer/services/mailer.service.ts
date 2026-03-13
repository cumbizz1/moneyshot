import { HttpException, Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { render } from 'mustache';
import { createTransport } from 'nodemailer';
import { join } from 'path';
import { QueueService, StringHelper } from 'src/kernel';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';

import { IMail } from '../interfaces';

const TEMPLATE_DIR = join(process.env.TEMPLATE_DIR, 'emails');
@Injectable()
export class MailerService {
  private mailerQueue;

  constructor(
    private readonly queueService: QueueService,
    private readonly settingService: SettingService
  ) {
    this.init();
  }

  private async init() {
    this.mailerQueue = this.queueService.createInstance('MAILER_QUEUE');
    this.mailerQueue.process(
      process.env.MAILER_CONCURRENCY || 1,
      this.process.bind(this)
    );
  }

  private async getTransport() {
    const [host, port, user, pass, secure] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.SMTP_HOST),
      this.settingService.getKeyValue(SETTING_KEYS.SMTP_PORT),
      this.settingService.getKeyValue(SETTING_KEYS.SMTP_USER),
      this.settingService.getKeyValue(SETTING_KEYS.SMTP_PASSWORD),
      this.settingService.getKeyValue(SETTING_KEYS.SMTP_SECURE)
    ]);
    if (!host || !port || !user || !pass) {
      throw new HttpException('Invalid smtp confirguration!', 422);
    }
    return createTransport({
      host,
      port: parseInt(port, 10),
      secure,
      auth: {
        user,
        pass
      },
      tls: { rejectUnauthorized: false }
    });
  }

  private getTemplate(template = 'default', isLayout = false): string {
    // eslint-disable-next-line no-param-reassign
    template = StringHelper.getFileName(template, true);

    if (template === 'blank') {
      return isLayout ? '[[BODY]]' : '';
    }

    const layoutFile = isLayout ? join(TEMPLATE_DIR, 'layouts', `${template}.html`) : join(TEMPLATE_DIR, `${template}.html`);
    if (!existsSync(layoutFile)) {
      return isLayout ? '[[BODY]]' : '';
    }

    return readFileSync(layoutFile, 'utf8');
  }

  private async process(job: any, done: Function) {
    try {
      const transport = await this.getTransport();
      const data = job.data as IMail;
      let { html } = data;
      if (!html && data.template) {
        html = this.getTemplate(data.template);
      }

      const body = html ? render(html, data.data) : '';
      const siteName = await this.settingService.getKeyValue(SETTING_KEYS.SITE_NAME);
      const logoUrl = await this.settingService.getKeyValue(SETTING_KEYS.LOGO_URL);
      const layout = this.getTemplate(data.layout, true);
      html = render(layout, {
        siteName: siteName || process.env.SITENAME || process.env.DOMAIN,
        logoUrl,
        subject: data.subject
      }).replace('[[BODY]]', body);
      const senderConfig = await this.settingService.getKeyValue(SETTING_KEYS.SENDER_EMAIL);
      const senderEmail = senderConfig || process.env.SENDER_EMAIL;
      await transport.sendMail({
        from: senderEmail,
        to: Array.isArray(data.to) ? data.to.join(',') : data.to,
        cc: Array.isArray(data.cc) ? data.cc.join(',') : data.cc,
        bcc: Array.isArray(data.cc) ? data.cc.join(',') : data.cc,
        subject: data.subject,
        html
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('mail_error', e);
    } finally {
      done();
    }
  }

  public async send(email: IMail) {
    await this.mailerQueue.createJob(email).save();
  }

  public async verify() {
    try {
      const transport = await this.getTransport();
      const siteName = await this.settingService.getKeyValue(SETTING_KEYS.SITE_NAME) || process.env.DOMAIN;
      const senderEmail = await this.settingService.getKeyValue(SETTING_KEYS.SENDER_EMAIL) || process.env.SENDER_EMAIL;
      const adminEmail = await this.settingService.getKeyValue(SETTING_KEYS.ADMIN_EMAIL) || process.env.ADMIN_EMAIL;
      return transport.sendMail({
        from: senderEmail,
        to: adminEmail,
        subject: `Test email ${siteName}`,
        html: 'Hello, this is test email!'
      });
    } catch (e) {
      return {
        hasError: true,
        error: e
      };
    }
  }
}
