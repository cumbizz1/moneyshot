export interface IGallery {
  _id: string;

  performerIds: string[];

  categoryIds: string[];

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

  stats: any;

  performers: any;

  createdBy: string;

  updatedBy: string;

  createdAt: Date;

  updatedAt: Date;
}
