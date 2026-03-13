import {
  IsArray, IsNotEmpty, IsOptional, IsString
} from 'class-validator';

export class PurchaseProductsPayload {
  @IsNotEmpty()
  @IsArray()
    products: [{
    quantity: number,
    _id: string
  }];

  @IsOptional()
  @IsString()
    couponCode: string;

  @IsOptional()
  @IsString()
    deliveryAddress: string;

  @IsOptional()
  @IsString()
    phoneNumber: string;

  @IsOptional()
  @IsString()
    postalCode: string;
}
