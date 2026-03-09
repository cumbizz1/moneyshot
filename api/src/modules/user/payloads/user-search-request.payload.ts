import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class UserSearchRequestPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    q: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    role: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    gender: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    country: string;

  constructor(options?: Partial<UserSearchRequestPayload>) {
    super(options);

    this.name = options?.name;
    this.q = options?.q;
    this.gender = options?.gender;
    this.role = options?.role;
    this.country = options?.country;
    this.status = options?.status;
  }
}
