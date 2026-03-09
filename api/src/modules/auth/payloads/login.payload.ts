import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength
} from 'class-validator';

export class LoginPayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
    username: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
    password: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
    remember: boolean;
}
