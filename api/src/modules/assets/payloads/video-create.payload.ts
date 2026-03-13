import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn, IsNotEmpty, IsObject, IsOptional, IsString
} from 'class-validator';

export class VideoCreatePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
    isSale: boolean;

  @ApiProperty()
  @IsOptional()
    isSchedule: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
    scheduledAt: Date;

  @ApiProperty()
  @IsOptional()
    tags: string[];

  @ApiProperty()
  @IsOptional()
    price: number;

  @ApiProperty()
  @IsOptional()
    performerIds: string[];

  @ApiProperty()
  @IsOptional()
    categoryIds: string[];

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

export class VideoCreateFtpPayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
    isSale: boolean;

  @ApiProperty()
  @IsOptional()
    isSchedule: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
    scheduledAt: Date;

  @ApiProperty()
  @IsOptional()
    tags: string[];

  @ApiProperty()
  @IsOptional()
    price: number;

  @ApiProperty()
  @IsOptional()
    performerIds: string[];

  @ApiProperty()
  @IsOptional()
    categoryIds: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
    videoOptions: {
    fileName: string;
    convertFile: boolean;
    keepOldFile: boolean;
  };

  @ApiProperty()
  @IsOptional()
  @IsObject()
    teaserOptions: {
    fileName: string;
    convertFile: boolean;
    keepOldFile: boolean;
  };

  @ApiProperty()
  @IsOptional()
  @IsObject()
    thumbnailOptions: {
    fileName: string;
    keepOldFile: boolean;
  };
}
