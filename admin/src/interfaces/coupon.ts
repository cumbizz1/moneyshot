export interface ICoupon {
  name: string;
  description: string;
  code: string;
  value: number;
  expiredDate: Date;
  timezone: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
