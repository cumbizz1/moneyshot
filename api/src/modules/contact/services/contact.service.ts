import { Injectable } from '@nestjs/common';
import { MailerService } from 'src/modules/mailer/services/mailer.service';
import { SettingService } from 'src/modules/settings';

@Injectable()
export class ContactService {
  constructor(
    private readonly mailService: MailerService
  ) {
  }

  public async contact(data: any) {
    const adminEmail = SettingService.getByKey('adminEmail').value || process.env.ADMIN_EMAIL;
    await this.mailService.send({
      subject: 'New contact',
      to: adminEmail,
      data,
      template: 'contact'
    });
    return true;
  }
}
