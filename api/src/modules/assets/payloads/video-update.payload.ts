import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn, IsObject, IsOptional, IsString
} from 'class-validator';
import { ObjectId } from 'mongodb';

export class VideoUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
    title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
    status: string;

  @ApiProperty()
  @IsOptional()
    tags: string[];

  @ApiProperty()
  @IsOptional()
    isSchedule: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
    scheduledAt: Date;

  @ApiProperty()
  @IsOptional()
    isSale: boolean;

  @ApiProperty()
  @IsOptional()
    price: number;

  @ApiProperty()
  @IsOptional()
    performerIds: ObjectId[];

  @ApiProperty()
  @IsOptional()
    categoryIds: ObjectId[];

  @ApiProperty()
  @IsOptional()
    videoConvertFile: boolean;

  @ApiProperty()
  @IsOptional()
    videoKeepFile: boolean;

  @ApiProperty()
  @IsOptional()
    teaserKeepFile: boolean;

  @ApiProperty()
  @IsOptional()
    teaserConvertFile: boolean;

  @ApiProperty()
  @IsOptional()
    thumbnailKeepFile: boolean;
}

export class VideoUpdateFtpPayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
    title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
    status: string;

  @ApiProperty()
  @IsOptional()
    tags: string[];

  @ApiProperty()
  @IsOptional()
    isSchedule: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
    scheduledAt: Date;

  @ApiProperty()
  @IsOptional()
    isSale: boolean;

  @ApiProperty()
  @IsOptional()
    price: number;

  @ApiProperty()
  @IsOptional()
    performerIds: ObjectId[];

  @ApiProperty()
  @IsOptional()
    categoryIds: ObjectId[];

  @ApiProperty()
  @IsObject()
  @IsOptional()
    videoOptions: {
    fileName: string;
    convertFile: boolean;
    keepOldFile: boolean;
  };

  @ApiProperty()
  @IsObject()
  @IsOptional()
    teaserOptions: {
    fileName: string;
    convertFile: boolean;
    keepOldFile: boolean;
  };

  @ApiProperty()
  @IsObject()
  @IsOptional()
    thumbnailOptions: {
    fileName: string;
    keepOldFile: boolean;
  };
}
