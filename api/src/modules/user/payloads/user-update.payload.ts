import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsIn, IsOptional, IsString, Validate
} from 'class-validator';

import { GENDERS } from '../constants';
import { Username } from '../validators/username.validator';

export class UserUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
    firstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    lastName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    name: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
    email: string;

  @ApiProperty()
  @IsString()
  @Validate(Username)
    username: string;

  @ApiProperty()
  @IsString()
  @IsIn(GENDERS)
  @IsOptional()
    gender: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    country: string;
}
