import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class PaymentSearchRequest extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    source: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    sourceId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    targetId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    performerId: string;

  @ApiProperty()
  @IsOptional()
    performerIds: any;

  @ApiProperty()
  @IsString()
  @IsOptional()
    status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    type: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    target: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    paymentGateway: string;

  @ApiProperty()
  @IsOptional()
    fromDate: Date;

  @ApiProperty()
  @IsOptional()
    toDate: Date;

  constructor(options?: Partial<PaymentSearchRequest>) {
    super(options);

    this.source = options?.source;
    this.targetId = options?.targetId;
    this.sourceId = options?.sourceId;
    this.performerId = options?.performerId;
    this.status = options?.status;
    this.performerIds = options?.performerIds;
    this.target = options?.target;
    this.paymentGateway = options?.paymentGateway;
    this.type = options?.type;
    this.fromDate = options?.fromDate;
    this.toDate = options?.toDate;
  }
}
