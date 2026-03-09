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
import { CurrentUser } from 'src/modules/auth';
import { AuthGuard } from 'src/modules/auth/guards';
import { FileDto, FileUploaded, FileUploadInterceptor } from 'src/modules/file';

import { UserDto } from '../dtos';
import { UserService } from '../services';

@Injectable()
@Controller('users')
export class AvatarController {
  static avatarDir: string;

  constructor(private readonly userService: UserService) {}

  @Post('/avatar/upload')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileUploadInterceptor('avatar', 'avatar', {
      destination: getConfig('file').avatarDir,
      uploadDirectly: true,
      generateThumbnail: true,
      replaceByThumbnail: true,
      thumbnailSize: getConfig('image').avatar
      // TODO - check option fir resize, etc...
    })
  )
  async uploadAvatar(
    @CurrentUser() user: UserDto,
    @FileUploaded() file: FileDto
  ): Promise<any> {
    await this.userService.updateAvatar(user, file);
    return DataResponse.ok({
      success: true,
      url: file.getUrl()
    });
  }
}
