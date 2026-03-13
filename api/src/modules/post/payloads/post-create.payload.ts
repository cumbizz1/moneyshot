import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ObjectId } from 'mongodb';

import { PostMetaPayload } from './post-meta.payload';

export class PostCreatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
    title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    authorId: ObjectId;

  @ApiProperty()
  @IsString()
    type = 'post';

  @ApiProperty()
  @IsString()
  @IsOptional()
    slug: string;

  @IsOptional()
    ordering: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
    content: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    shortDescription: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
    categoryIds: string[] = [];

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['draft', 'published'])
    status = 'draft';

  @ApiProperty()
  @IsString()
  @IsOptional()
    image: string;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
    meta?: PostMetaPayload[];
}
