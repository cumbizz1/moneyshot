import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class PhotoCreatePayload {
  @ApiProperty()
  @IsOptional()
    title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
    status: string;

  @ApiProperty()
  // @IsNumber()
  @IsOptional()
    price: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
    target: string = 'gallery';

  @ApiProperty()
  @IsString()
  @IsOptional()
    tagetId: string;

  @ApiProperty()
  @IsOptional()
    photoKeepFile: boolean;
}

export class PhotoCreateFtpPayload {
  @ApiProperty()
  @IsOptional()
    title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
    status: string;

  @ApiProperty()
  @IsOptional()
    price: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
    target: string = 'gallery';

  @ApiProperty()
  @IsString()
  @IsOptional()
    tagetId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
    photoFileName: string;

  @ApiProperty()
  @IsOptional()
    photoKeepFile: boolean;
}
