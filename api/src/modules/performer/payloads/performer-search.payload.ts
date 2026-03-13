import {
  IsISO31661Alpha2, IsMongoId, IsOptional, IsString, ValidateIf
} from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class PerformerSearchRequest extends SearchRequest {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  q: string;

  @IsString()
  @IsOptional()
  age: string;

  @IsString()
  @IsOptional()
  fromAge: Date;

  @IsString()
  @IsOptional()
  toAge: Date;

  @IsString()
  @IsOptional()
  gender: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsOptional()
  @IsString()
  @IsISO31661Alpha2()
  @ValidateIf((o) => !!o.country)
  country: string;

  @IsString()
  @IsOptional()
  @IsMongoId()
  @ValidateIf((o) => !!o.categoryId)
  categoryId: string;

  @IsOptional()
  categoryIds: string[];

  @IsOptional()
  includedIds: string[];

  @IsOptional()
  @IsString()
  hair: string;

  @IsOptional()
  @IsString()
  pubicHair: string;

  @IsOptional()
  @IsString()
  ethnicity: string;

  @IsOptional()
  @IsString()
  bodyType: string;

  @IsOptional()
  @IsString()
  height: string;

  @IsOptional()
  @IsString()
  weight: string;

  @IsOptional()
  @IsString()
  eyes: string;

  @IsOptional()
  @IsString()
  butt: string;

  @IsOptional()
  @IsString()
  sexualOrientation: string;
}
