import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString
} from 'class-validator';
import { ObjectId } from 'mongodb';

import { PRODUCT_STATUS, PRODUCT_TYPE } from '../constants';

export class ProductUpdatePayload {
  @ApiProperty()
  @IsOptional()
    name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn([PRODUCT_STATUS.ACTIVE, PRODUCT_STATUS.INACTIVE])
    status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn([PRODUCT_TYPE.DIGITAL, PRODUCT_TYPE.PHYSICAL])
    type: string;

  @ApiProperty()
  @IsOptional()
    price: number;

  @ApiProperty()
  @IsOptional()
    stock: number;

  @ApiProperty()
  @IsOptional()
    categoryIds: ObjectId[];

  @ApiProperty()
  @IsOptional()
    imageIds: ObjectId[];
}
