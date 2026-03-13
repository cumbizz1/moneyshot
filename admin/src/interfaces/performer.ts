export interface IPerformer {
  _id: string;
  performerId: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  phoneCode: string;
  avatarPath: string;
  avatar: any;
  coverPath: string;
  cover: any;
  gender: string;
  country: string;
  city: string;
  state: string;
  zipcode: string;
  address: string;
  languages: string[];
  categoryIds: string[];
  height: string;
  weight: string;
  bio: string;
  eyes: string;
  sexualOrientation: string;
  stats: {
    likes?: number;
    views?: number;
    totalVideos?: number;
    totalPhotos?: number;
    totalGalleries?: number;
    totalProducts?: number;
    avgRating?: number;
  };
  score: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isOnline: boolean;
  verifiedAccount: boolean;
  verifiedEmail: boolean;
  verifiedDocument: boolean;
  twitterConnected: boolean;
  googleConnected: boolean;
  welcomeVideoId: string;
  welcomeVideoPath: string;
  activateWelcomeVideo: boolean;
  isBookMarked: boolean;
  isSubscribed: boolean;
  ethnicity: string;
  bust: string;
  hair: string;
  pubicHair: string;
  idVerification: any;
  documentVerification: any;
  bodyType: string;
  dateOfBirth: Date;
  publicChatPrice: number;
  groupChatPrice: number;
  privateChatPrice: number;
  balance: number;
  socialsLink: {
    facebook: string;
    google: string;
    instagram: string;
    twitter: string;
    linkedIn: string;
  }
  commissionSetting: any;
  ccbillSetting: any;
  paypalSetting: any;
}

export interface IBody {
  heights: [{ value: string; text: string }];
  weights: [{ value: string; text: string }];
  genders: [{ value: string; text: string }];
  sexualOrientations: [{ value: string; text: string }];
  ages: [{ value: string; text: string }];
  eyes: [{ value: string; text: string }];
  butts: [{ value: string; text: string }];
  pubicHairs: [{ value: string; text: string }];
  hairs: [{ value: string; text: string }];
  ethnicities: [{ value: string; text: string }];
  bodyTypes: [{ value: string; text: string }];
}
