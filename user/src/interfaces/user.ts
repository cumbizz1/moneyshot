import { ISearch } from './utils';

export interface IUser {
  _id: string;
  avatar: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  username: string;
  role?: string;
  isOnline?: boolean;
  isSubscribed?: boolean;
  memberShipExpiredAt?: Date;
}

export interface IUserFormData {
  avatar?: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export interface IUserSearch extends ISearch {
  role?: string;
}
