import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsEmail, IsIn, IsNumber, IsOptional, IsString
} from 'class-validator';

import {
  GENDERS, ROLE_ADMIN, ROLE_USER, STATUSES
} from '../constants';

export class UserAuthUpdatePayload {
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
  @IsString()
  @IsOptional()
    username: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
    email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    password: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  @IsIn([ROLE_ADMIN, ROLE_USER], { each: true })
    roles: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(STATUSES)
    status: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
    balance: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(GENDERS)
    gender: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    country: string;
}
