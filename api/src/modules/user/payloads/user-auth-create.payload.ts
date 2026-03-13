import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsEmail, IsIn, IsNumber, IsOptional, IsString
} from 'class-validator';

import { ROLE_ADMIN, ROLE_USER, STATUSES } from '../constants';
import { UserCreatePayload } from './user-create.payload';

export class UserAuthCreatePayload extends UserCreatePayload {
  @ApiProperty()
  @IsString()
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
  @IsIn(STATUSES)
    status: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
    balance: number;

  constructor(params: Partial<UserAuthCreatePayload>) {
    super(params);
    if (params) {
      this.roles = params.roles;
      this.password = params.password;
      this.balance = params.balance;
    }
  }
}
