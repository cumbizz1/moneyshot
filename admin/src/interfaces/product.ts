export interface IProduct {
  _id: string;
  name: string;
  description: string;
  status: string;
  type: string;
  images: any[];
  imageIds: string[];
  categoryIds: string[];
  price: number;
  stock: number;
}
