import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SettingUpdatePayload {
  @ApiProperty()
  @IsOptional()
    value: any;

  @ApiProperty()
  @IsString()
  @IsOptional()
    name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    description: string;
}
