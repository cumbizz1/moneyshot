import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubscribePayload {
  @IsNotEmpty()
  packageId: string;

  @IsOptional()
  @IsString()
  paymentGateway?: string;

  @IsOptional()
  @IsString()
  method?: string;
}
