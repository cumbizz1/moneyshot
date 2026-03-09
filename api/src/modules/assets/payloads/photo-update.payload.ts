import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString
} from 'class-validator';

export class PhotoUpdatePayload {
  @ApiProperty()
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
    price: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
    targetId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    target: string;
}
