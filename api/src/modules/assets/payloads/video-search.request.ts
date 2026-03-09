import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class VideoSearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    performerId: string;

  @ApiProperty()
  @IsOptional()
    performerIds: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
    excludedId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    status: string;

  @ApiProperty()
  @IsOptional()
    isSale: string;

  @ApiProperty()
  @IsOptional()
    isSchedule: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    categoryId: string;

  @ApiProperty()
  @IsOptional()
    categoryIds: string[];

  constructor(options?: Partial<VideoSearchRequest>) {
    super(options);

    this.status = options?.status;
    this.performerId = options?.performerId;
    this.performerIds = options?.performerIds;
    this.categoryId = options?.categoryId;
    this.categoryIds = options?.categoryIds;
    this.excludedId = options?.excludedId;
    this.isSale = options?.isSale;
    this.isSchedule = options?.isSchedule;
  }
}
