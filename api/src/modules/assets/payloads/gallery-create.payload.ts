import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class GalleryCreatePayload {
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
  @IsIn(['active', 'inactive', 'draft'])
    status: string;

  @ApiProperty()
  @IsOptional()
    price: number;

  @ApiProperty()
  @IsNotEmpty()
    performerIds: string[];
}
