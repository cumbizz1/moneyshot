import { pick } from 'lodash';
import { ObjectId } from 'mongodb';
import { FileDto } from 'src/modules/file';

export interface IPerformerResponse {
  _id: ObjectId;

  name?: string;

  firstName?: string;

  lastName?: string;

  username?: string;

  email?: string;

  phone?: string;

  phoneCode?: string; // international code prefix

  status?: string;

  avatarId?: ObjectId;

  avatarPath?: string;

  coverId?: ObjectId;

  coverPath?: string;

  avatar?: any;

  cover?: any;

  gender?: string;

  country?: string;

  city?: string;

  state?: string;

  zipcode?: string;

  address?: string;

  languages?: string[];

  categoryIds?: ObjectId[];

  categories?: any[];

  height?: string;

  weight?: string;

  bio?: string;

  eyes?: string;

  hair?: string;

  pubicHair?: string;

  bodyType?: string;

  butt?: string;

  ethnicity?: string;

  dateOfBirth?: Date;

  sexualOrientation?: string;

  stats?: {
    likes?: number;
    views?: number;
    totalVideos: number;
    totalGalleries: number;
    totalProducts: number;
  };

  score?: number;

  createdBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  welcomeVideoId?: ObjectId;

  welcomeVideoPath?: string;

  activateWelcomeVideo?: boolean;
}

export class PerformerDto {
  _id: ObjectId;

  name?: string;

  firstName?: string;

  lastName?: string;

  username?: string;

  email?: string;

  phone?: string;

  phoneCode?: string; // international code prefix

  status?: string;

  avatarId?: ObjectId;

  avatarPath?: string;

  coverId?: ObjectId;

  coverPath?: string;

  avatar?: any;

  cover?: any;

  gender?: string;

  country?: string;

  city?: string;

  state?: string;

  zipcode?: string;

  address?: string;

  languages?: string[];

  categoryIds?: ObjectId[];

  categories?: any[];

  height?: string;

  weight?: string;

  bio?: string;

  eyes?: string;

  hair?: string;

  pubicHair?: string;

  bodyType?: string;

  butt?: string;

  ethnicity?: string;

  dateOfBirth?: Date;

  sexualOrientation?: string;

  stats?: {
    likes?: number;
    views?: number;
    totalVideos: number;
    totalGalleries: number;
    totalProducts: number;
  };

  score?: number;

  createdBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  welcomeVideoId?: ObjectId;

  welcomeVideoPath?: string;

  activateWelcomeVideo?: boolean;

  constructor(data?: Partial<any>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'name',
        'firstName',
        'lastName',
        'dateOfBirth',
        'name',
        'username',
        'email',
        'phone',
        'phoneCode',
        'status',
        'avatarId',
        'avatarPath',
        'coverId',
        'coverPath',
        'gender',
        'country',
        'city',
        'state',
        'zipcode',
        'address',
        'languages',
        'categoryIds',
        'categories',
        'height',
        'weight',
        'bio',
        'hair',
        'pubicHair',
        'bodyType',
        'butt',
        'ethnicity',
        'eyes',
        'sexualOrientation',
        'stats',
        'score',
        'createdBy',
        'createdAt',
        'updatedAt',
        'welcomeVideoId',
        'welcomeVideoPath',
        'activateWelcomeVideo'
      ])
    );
  }

  toResponse(includePrivateInfo = false, isAdmin: boolean = false) {
    const publicInfo = {
      _id: this._id,
      name: this.name || this.getName(),
      avatar: FileDto.getPublicUrl(this.avatarPath),
      cover: FileDto.getPublicUrl(this.coverPath),
      username: this.username,
      gender: this.gender,
      dateOfBirth: this.dateOfBirth,
      country: this.country,
      stats: this.stats,
      bodyType: this.bodyType,
      categoryIds: this.categoryIds,
      categories: this.categories,
      height: this.height,
      weight: this.weight,
      bio: this.bio,
      eyes: this.eyes,
      hair: this.hair,
      pubicHair: this.pubicHair,
      butt: this.butt,
      ethnicity: this.ethnicity,
      languages: this.languages,
      sexualOrientation: this.sexualOrientation,
      welcomeVideoId: this.welcomeVideoId,
      welcomeVideoPath: FileDto.getPublicUrl(this.welcomeVideoPath),
      activateWelcomeVideo: this.activateWelcomeVideo
    };
    const privateInfo = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      phoneCode: this.phoneCode,
      status: this.status,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      address: this.address,
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

  getName() {
    if (this.name) return this.name;
    return [this.firstName || '', this.lastName || ''].join(' ');
  }

  toSearchResponse() {
    return {
      _id: this._id,
      name: this.name || this.getName(),
      avatar: FileDto.getPublicUrl(this.avatarPath),
      username: this.username,
      gender: this.gender,
      languages: this.languages,
      stats: this.stats,
      score: this.score
    };
  }

  toPublicDetailsResponse() {
    return {
      _id: this._id,
      name: this.name || this.getName(),
      avatar: FileDto.getPublicUrl(this.avatarPath),
      cover: FileDto.getPublicUrl(this.coverPath),
      username: this.username,
      gender: this.gender,
      dateOfBirth: this.dateOfBirth,
      country: this.country,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      address: this.address,
      stats: this.stats,
      bodyType: this.bodyType,
      categoryIds: this.categoryIds,
      categories: this.categories,
      height: this.height,
      weight: this.weight,
      bio: this.bio,
      eyes: this.eyes,
      hair: this.hair,
      pubicHair: this.pubicHair,
      butt: this.butt,
      ethnicity: this.ethnicity,
      languages: this.languages,
      sexualOrientation: this.sexualOrientation,
      score: this.score,
      welcomeVideoId: this.welcomeVideoId,
      welcomeVideoPath: FileDto.getPublicUrl(this.welcomeVideoPath),
      activateWelcomeVideo: this.activateWelcomeVideo
    };
  }
}
