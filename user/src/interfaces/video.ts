export interface IVideo {
  _id: string;

  performerIds: string[];

  categoryIds: string[];

  categories: any[];

  fileId: string;

  title: string;

  slug: string;

  description: string;

  status: string;

  tags: string[];

  teaserId: string;

  teaser: any;

  teaserProcessing: boolean;

  processing: boolean;

  thumbnailId: string;

  isSale: boolean;

  price: number;

  isSchedule: boolean;

  scheduledAt: Date;

  thumbnail: any;

  video: any;

  performers: any[];

  stats: {
    views: number;
    likes: number;
    favourites: number;
    comments: number;
    wishlist: number;
  };

  isLiked: boolean;

  isFavourited: boolean;

  isWatchedLater: boolean;

  isBought: boolean;

  createdBy: string;

  updatedBy: string;

  createdAt: Date;

  updatedAt: Date;
}
