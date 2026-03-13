import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel';

export class SubscriptionPackageSearchPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    status: string;

  constructor(options?: Partial<SubscriptionPackageSearchPayload>) {
    super(options);

    this.name = options?.name;
    this.status = options?.status;
  }
}
