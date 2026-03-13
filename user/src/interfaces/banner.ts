export interface IBanner {
  _id: string;
  title: string;
  description: string;
  status: string;
  position: string;
  link: string;
  autoplaySpeed: number;
  photo: { url: string; thumbnails: string[] };
}
