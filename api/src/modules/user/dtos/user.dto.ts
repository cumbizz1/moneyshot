import { pick } from 'lodash';
import { ObjectId } from 'mongodb';
import { FileDto } from 'src/modules/file';

export interface IUserResponse {
  _id?: ObjectId;
  name?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  avatar?: string;
  status?: string;
  gender?: string;
  country?: string;
  verifiedEmail?: boolean;
  isOnline?: boolean;
  isSubscribed?: boolean;
  memberShipExpiredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserDto {
  _id: ObjectId;

  name?: string;

  firstName?: string;

  lastName?: string;

  email?: string;

  phone?: string;

  roles: string[] = ['user'];

  avatarId?: string | ObjectId;

  avatarPath?: string;

  status?: string;

  username?: string;

  gender?: string;

  country?: string; // iso code

  verifiedEmail?: boolean;

  isOnline?: boolean;

  isSubscribed?: boolean;

  memberShipExpiredAt?: Date;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(data?: Partial<UserDto>) {
    data
      && Object.assign(
        this,
        pick(data, [
          '_id',
          'name',
          'firstName',
          'lastName',
          'email',
          'phone',
          'roles',
          'avatarId',
          'avatarPath',
          'status',
          'username',
          'gender',
          'country',
          'verifiedEmail',
          'isOnline',
          'isSubscribed',
          'memberShipExpiredAt',
          'createdAt',
          'updatedAt'
        ])
      );
  }

  getName() {
    if (this.name) return this.name;
    return [this.firstName || '', this.lastName || ''].join(' ');
  }

  toResponse(includePrivateInfo = false, isAdmin: boolean = false): IUserResponse {
    const publicInfo = {
      _id: this._id,
      name: this.name || this.getName(),
      avatar: FileDto.getPublicUrl(this.avatarPath),
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      isOnline: this.isOnline
    };

    const privateInfo = {
      email: this.email,
      phone: this.phone,
      status: this.status,
      gender: this.gender,
      country: this.country,
      roles: this.roles,
      verifiedEmail: this.verifiedEmail,
      isSubscribed: this.isSubscribed,
      memberShipExpiredAt: this.memberShipExpiredAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    if (isAdmin) {
      return {
        ...publicInfo,
        ...privateInfo
      };
    }

    if (!includePrivateInfo) {
      return publicInfo;
    }

    return {
      ...publicInfo,
      ...privateInfo
    };
  }
}
