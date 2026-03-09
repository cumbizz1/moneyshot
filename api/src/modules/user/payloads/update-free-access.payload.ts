import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateFreeAccessPayload {
  @ApiProperty()
  @IsBoolean()
    hasFreeVideoAccess: boolean;
}

export class BulkUpdateFreeAccessPayload {
  @ApiProperty({ type: [String] })
    userIds: string[];

  @ApiProperty()
  @IsBoolean()
    hasFreeVideoAccess: boolean;
}
