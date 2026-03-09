import { ISearch } from './utils';

export interface ISubscriptionPackage {
  _id: string;
  name: string;
  description: string;
  ordering: number;
  price: number;
  isActive: boolean;
  tokens: number;
  updatedAt: Date;
  createdAt: Date;
  type: string;
  recurringPrice: number;
  recurringPeriod: number;
}

export interface ISubscriptionPackageCreate {
  name: string;
  description: string;
  ordering: number;
  isActive: boolean;
  price: number;
  tokens: number;
  type: string;
  recurringPrice: number;
  recurringPeriod: number;
}

export interface ISubscriptionPackageUpdate {
  _id: string;
  name: string;
  description: string;
  ordering: number;
  isActive: boolean;
  price: number;
  tokens: number;
  type: string;
  recurringPrice: number;
  recurringPeriod: number;
}

export interface ISubscriptionPackageSearch extends ISearch {
  status?: string;
  name?: string;
}
