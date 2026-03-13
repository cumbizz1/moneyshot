import {
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { DataResponse, getConfig } from 'src/kernel';
import { CurrentUser, Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';
import { FileDto, FileUploaded, FileUploadInterceptor } from 'src/modules/file';

import { UserDto } from '../../user/dtos';

@Injectable()
@Controller('admin/settings/files')
export class SettingFileUploadController {
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileUploadInterceptor('setting', 'file', {
      destination: getConfig('file').settingDir,
      uploadDirectly: true
    })
  )
  async uploadFile(
    @CurrentUser() user: UserDto,
    @FileUploaded() file: FileDto
  ): Promise<any> {
    return DataResponse.ok({
      ...file,
      url: file.getUrl()
    });
  }
}
