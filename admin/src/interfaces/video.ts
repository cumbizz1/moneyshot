export interface IVideo {
  _id: string;

  performerIds: string[];

  categoryIds: string[];

  fileId: string;

  title: string;

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

  thumbnail: any;

  video: any;

  performers: any[];

  stats: {
    views: number;
    likes: number;
    comments: number;
  };

  isSchedule: boolean;

  scheduledAt: any;

  createdBy: string;

  updatedBy: string;

  createdAt: Date;

  updatedAt: Date;
}

export interface IVideoCreate {
  tags: string[];
  title: string;
  performerIds: string[];
  categoryIds: string[];
  price: number;
  status: string;
  description: string;
  isSale: boolean;
  isSchedule: boolean;
  scheduledAt: any;
}

export interface IVideoUpdate {
  _id: string;
  performerIds: string[];
  categoryIds: string[];
  title: string;
  price: number;
  status: string;
  description: string;
  thumbnail: string;
  isSale: boolean;
  video: { url: string; thumbnails: string[] };
  performer: { username: string };
  isSchedule: boolean;
  scheduledAt: any;
}
