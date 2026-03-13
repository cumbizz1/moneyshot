import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class GallerySearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    excludedId: string;

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
    categoryId: string;

  @ApiProperty()
  @IsOptional()
    categoryIds: string[];

  @ApiProperty()
  @IsOptional()
    includedIds: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
    status: string;

  constructor(options?: Partial<GallerySearchRequest>) {
    super(options);

    this.status = options?.status;
    this.performerId = options?.performerId;
    this.performerIds = options?.performerIds;
    this.categoryId = options?.categoryId;
    this.categoryIds = options?.categoryIds;
    this.excludedId = options?.excludedId;
    this.includedIds = options?.includedIds;
  }
}
