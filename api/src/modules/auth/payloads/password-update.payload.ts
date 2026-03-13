import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsOptional, IsString, MinLength
} from 'class-validator';

export class PasswordChangePayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
    source = 'user';

  @ApiProperty()
  @IsOptional()
  @IsString()
    type = 'email';

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
    password: string;
}

export class PasswordUserChangePayload {
  @ApiProperty()
  @IsOptional()
  @IsString()
    type = 'email';

  @ApiProperty()
  @IsOptional()
  @IsString()
    source: string;

  @ApiProperty()
  @IsString()
    userId: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
    password: string;
}
