import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

import { COUPON_STATUS } from '../constants';

export class CouponUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    code: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
    value: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    expiredDate: string | Date;

  @ApiProperty()
  @IsString()
  @IsIn([COUPON_STATUS.ACTIVE, COUPON_STATUS.INACTIVE])
  @IsOptional()
    status = COUPON_STATUS.ACTIVE;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
    numberOfUses: number;
}
