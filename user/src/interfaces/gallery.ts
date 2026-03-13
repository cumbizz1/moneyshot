import { ICategory } from './category';

export interface IGallery {
  _id: string;

  performerIds: string[];

  type: string;

  name: string;

  slug: string;

  description: string;

  status: string;

  processing: boolean;

  coverPhotoId: string;

  isSale: boolean;

  price: number;

  coverPhoto: Record<string, any>;

  stats: {
    likes: number;
    views: number;
    favourites: number;
    comments: number;
  };

  numOfItems: number;

  performers: any;

  createdBy: string;

  updatedBy: string;

  createdAt: Date;

  updatedAt: Date;

  categories: ICategory[];

  isLiked: boolean;

  isFavourited: boolean;
}
