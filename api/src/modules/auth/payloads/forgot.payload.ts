import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail, IsNotEmpty, IsOptional, IsString
} from 'class-validator';

export class ForgotPayload {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
    email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    type: string;
}
