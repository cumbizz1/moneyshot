import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class CategorySearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    group: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    slug: string;

  @ApiProperty()
  @IsOptional()
    includedIds: string[];

  constructor(options?: Partial<CategorySearchRequest>) {
    super(options);

    this.status = options?.status;
    this.group = options?.group;
    this.slug = options?.slug;
    this.includedIds = options?.includedIds;
  }
}
