import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional, IsString
} from 'class-validator';
import { SortOrder } from 'mongoose';

export class SearchRequest {
  @ApiProperty()
  @IsOptional()
  @IsString()
    q = '';

  @ApiProperty()
  @IsOptional()
    limit: number = 10;

  @ApiProperty()
  @IsOptional()
    offset: number = 0;

  @ApiProperty()
  @Optional()
  @IsString()
    sortBy = 'updatedAt';

  @ApiProperty()
  @Optional()
  @IsString()
    sort: SortOrder = 'desc';

  constructor(options?: any) {
    if (!options) {
      // eslint-disable-next-line no-param-reassign
      options = {};
    }

    this.limit = parseInt(options.limit as string, 10) || 10;
    this.offset = parseInt(options.offset as string, 10) || 0;

    this.q = options.q || '';
    if (this.limit > 200) this.limit = 200;
    else if (this.limit < 0) this.limit = 10;
    this.offset = this.offset < 0 ? 0 : this.offset;
    this.sort = options.sort !== 'asc' ? 'desc' : 'asc';
    this.sortBy = (options.sortBy as string) || 'updatedAt';
  }
}
