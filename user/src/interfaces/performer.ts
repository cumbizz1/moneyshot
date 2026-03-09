export interface IPerformer {
  _id: string;

  name: string;

  firstName: string;

  lastName: string;

  username: string;

  email: string;

  phone: string;

  phoneCode: string; // international code prefix

  status: string;

  avatarId: string;

  avatarPath: string;

  coverId: string;

  coverPath: string;

  avatar: any;

  cover: any;

  gender: string;

  country: string;

  city: string;

  state: string;

  zipcode: string;

  address: string;

  languages: string[];

  categoryIds: string[];

  timezone: string;

  noteForUser: string;

  height: string;

  weight: string;

  bio: string;

  eyes: string;

  hair: string;

  pubicHair: string;

  butt: string;

  dateOfBirth: Date;

  sexualOrientation: string;

  ethnicity: string;

  stats: {
    likes: number;
    views: number;
    totalVideos: number;
    totalGalleries: number;
    totalProducts: number;
  };

  score: number;

  createdBy: string;

  createdAt: Date;

  updatedAt: Date;

  welcomeVideoId: string;

  welcomeVideoPath: string;

  activateWelcomeVideo: boolean;

  bodyType: string;
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
