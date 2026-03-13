import { IsNotEmpty } from 'class-validator';

export class SubscribePayload {
  @IsNotEmpty()
    packageId: string;
}
