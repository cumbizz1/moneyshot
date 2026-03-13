export interface IProduct {
  _id?: string;
  imageIds?: string[];
  images?: any[];
  categoryIds?: string[];
  categories?: any[];
  type?: string;
  name?: string;
  slug?: string;
  description?: string;
  status?: string;
  price?: number;
  stock?: number;
  performer?: any;
  createdAt?: Date;
  updatedAt?: Date;
  quantity?: number;
}
