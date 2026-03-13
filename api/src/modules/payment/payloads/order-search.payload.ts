import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SearchRequest } from 'src/kernel/common';

export class OrderSearchPayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    userId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    buyerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    sellerId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    deliveryStatus: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    type: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    productType: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    status: string;

  @ApiProperty()
  @IsOptional()
    fromDate: Date;

  @ApiProperty()
  @IsOptional()
    toDate: Date;

  constructor(options?: Partial<OrderSearchPayload>) {
    super(options);

    this.userId = options?.userId;
    this.buyerId = options?.buyerId;
    this.status = options?.status;
    this.sellerId = options?.sellerId;
    this.deliveryStatus = options?.deliveryStatus;
    this.productType = options?.productType;
    this.type = options?.type;
    this.fromDate = options?.fromDate;
    this.toDate = options?.toDate;
  }
}

export class OrderUpdatePayload extends SearchRequest {
  @ApiProperty()
  @IsString()
  @IsOptional()
    deliveryStatus: string;

  @ApiProperty()
  @IsOptional()
    shippingCode: string;

  constructor(options?: Partial<OrderUpdatePayload>) {
    super(options);

    this.shippingCode = options?.shippingCode;
    this.deliveryStatus = options?.deliveryStatus;
  }
}
