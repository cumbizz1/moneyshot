import { ObjectId } from 'mongodb';
import { S3ObjectCannelACL } from 'src/modules/storage/contants';
import { UserDto } from 'src/modules/user/dtos';

/**
 * @param storage Storage
 * @uploadDirectly Upload to Storage immediately
 * @acl Access Control List
 */
export interface IFileUploadOptions {
  uploader?: UserDto;
  convertMp4?: boolean;
  generateThumbnail?: boolean;
  replaceByThumbnail?: boolean;
  createThumbs?: boolean;
  thumbnailSize?: {
    width: number;
    height: number;
  },
  refItem?: {
    itemId: ObjectId;
    itemType: string;
  };
  fileName?: string;
  destination?: string;
  server?: string;
  uploadDirectly?: boolean;
  acl?: S3ObjectCannelACL;
}
