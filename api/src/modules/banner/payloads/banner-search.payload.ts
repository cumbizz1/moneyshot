import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class BannerSearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    status: string;

  constructor(options?: Partial<BannerSearchRequest>) {
    super(options);

    this.status = options?.status;
  }
}
