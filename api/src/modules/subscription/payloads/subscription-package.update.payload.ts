/* eslint-disable camelcase */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString
} from 'class-validator';

export class SubscriptionPackageUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    description: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
    ordering: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
    price: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
    initialPeriod: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
    recurringPrice: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
    recurringPeriod: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
    type: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
    isActive: boolean;
}
