import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { BANNER_POSITION } from '../constants';

export class BannerUpdatePayload {
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
    link: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
    status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(BANNER_POSITION)
    position: string;
}
