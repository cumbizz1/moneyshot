import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class PerformerSearchRequest extends SearchRequest {
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
    age: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    fromAge: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
    toAge: Date;

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

  constructor(options?: Partial<PerformerSearchRequest>) {
    super(options);

    this.name = options?.name;
    this.q = options?.q;
    this.age = options?.age;
    this.fromAge = options?.fromAge;
    this.toAge = options?.toAge;
    this.gender = options?.gender;
    this.status = options?.status;
    this.country = options?.country;
    this.categoryId = options?.categoryId;
    this.categoryIds = options?.categoryIds;
    this.includedIds = options?.includedIds;
  }
}
