import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
  UseGuards
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { Roles } from 'src/modules/auth';
import { RoleGuard } from 'src/modules/auth/guards';

import { FileService } from '../services';

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService
  ) { }

  @Get('download')
  @HttpCode(HttpStatus.OK)
  public async downloadFile(
    @Res() response: any,
    @Query('key') key: string
  ): Promise<any> {
    const info = await this.fileService.getStreamToDownload(key);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=${info.file.name}`
    );

    info.stream.pipe(response);
  }

  @Get('/ftp-folder')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @UseGuards(RoleGuard)
  async ftpFilePaths() {
    const resp = await this.fileService.getFtpFilePath();
    return DataResponse.ok(resp);
  }
}
