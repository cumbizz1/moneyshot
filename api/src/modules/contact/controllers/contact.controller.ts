import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';

import { ContactPayload } from '../payloads/contact.payload';
import { ContactService } from '../services';

@Injectable()
@Controller('contact')
export class ContactController {
  constructor(
    private readonly contactService: ContactService
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async contact(
    @Body() payload: ContactPayload
  ): Promise<DataResponse<any>> {
    await this.contactService.contact(payload);
    return DataResponse.ok({ success: true });
  }
}
