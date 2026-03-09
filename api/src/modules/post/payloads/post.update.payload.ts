import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsIn, IsOptional, IsString
} from 'class-validator';

export class PostUpdatePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
    title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    authorId: string;

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
    status;

  @ApiProperty()
  @IsString()
  @IsOptional()
    image: string;
}
