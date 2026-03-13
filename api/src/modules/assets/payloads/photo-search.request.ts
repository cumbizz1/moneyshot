import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class PhotoSearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    target: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    targetId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    status: string;

  constructor(options?: Partial<PhotoSearchRequest>) {
    super(options);

    this.status = options?.status;
    this.target = options?.target;
    this.targetId = options?.targetId;
  }
}
