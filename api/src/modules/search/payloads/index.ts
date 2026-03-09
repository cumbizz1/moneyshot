import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class SearchPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    categoryId: string;

  @ApiProperty()
  @IsOptional()
    categoryIds: string[];

  constructor(options?: Partial<SearchPayload>) {
    super(options);

    this.categoryId = options?.categoryId;
    this.categoryIds = options?.categoryIds;
  }
}
