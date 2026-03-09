import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class PerformerModel extends Document {
  name: string;

  firstName: string;

  lastName: string;

  username: string;

  email: string;

  phone: string;

  phoneCode: string; // international code prefix

  avatarId: ObjectId;

  avatarPath: string;

  coverId: ObjectId;

  coverPath: string;

  gender: string;

  country: string;

  city: string;

  state: string;

  zipcode: string;

  address: string;

  languages: string[];

  categoryIds: ObjectId[];

  height: string;

  weight: string;

  bio: string;

  eyes: string;

  sexualOrientation: string;

  butt: string;

  pubicHair: string;

  hair: string;

  bodyType: string;

  ethnicity: string;

  dateOfBirth: Date;

  stats: {
    likes: number;
    subscribers: number;
    views: number;
    totalVideos: number;
    totalGalleries: number;
    totalProducts: number;
  };

  // score custom from other info like likes, subscribes, views....
  score: number;

  createdBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;

  welcomeVideoId: ObjectId;

  welcomeVideoPath: string;

  activateWelcomeVideo: boolean;

  status: string;
}
