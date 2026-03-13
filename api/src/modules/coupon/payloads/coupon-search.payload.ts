import { SearchRequest } from 'src/kernel/common';

export class CouponSearchRequestPayload extends SearchRequest {
  name?: string;

  code?: string;

  status?: string;

  constructor(options?: Partial<CouponSearchRequestPayload>) {
    super(options);

    this.name = options?.name;
    this.code = options?.code;
    this.status = options?.status;
  }
}
