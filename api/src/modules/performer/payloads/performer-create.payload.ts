import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { GENDERS } from 'src/modules/user/constants';
import { Username } from 'src/modules/user/validators/username.validator';

import { PERFORMER_STATUSES } from '../constants';

export class PerformerCreatePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    lastName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Validate(Username)
  @IsNotEmpty()
    username: string;

  @ApiProperty()
  @IsString()
  @IsIn([
    PERFORMER_STATUSES.ACTIVE,
    PERFORMER_STATUSES.INACTIVE,
    PERFORMER_STATUSES.PENDING
  ])
  @IsOptional()
    status = PERFORMER_STATUSES.ACTIVE;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
    email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    phoneCode?: string; // international code prefix

  @ApiProperty()
  @IsString()
  @IsOptional()
    avatarId?: ObjectId;

  @ApiProperty()
  @IsString()
  @IsOptional()
    coverId?: ObjectId;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(GENDERS)
    gender?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    country?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    city?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    state?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    zipcode?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    address?: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
    languages?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
    categoryIds?: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
    height?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    weight?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    bio?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    eyes?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    sexualOrientation: string;
}
