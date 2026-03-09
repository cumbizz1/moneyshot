import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PostMetaPayload {
  @ApiProperty()
  @IsString()
    key: string;

  @ApiProperty()
  @IsOptional()
    value: any;
}
