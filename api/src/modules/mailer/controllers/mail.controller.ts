import {
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';

import { Roles } from '../../auth';
import { RoleGuard } from '../../auth/guards';
import { MailerService } from '../services';

@Injectable()
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailService: MailerService) {}

  @Post('/verify')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async verify(): Promise<DataResponse<any>> {
    try {
      const data = await this.mailService.verify();
      return DataResponse.ok(data);
    } catch (e) {
      throw new HttpException(e, 400);
    }
  }
}
