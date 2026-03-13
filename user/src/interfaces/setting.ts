export interface ISettings {
  metaKeywords: string;
  metaDescription: string;
}

export interface IContact {
  email: string;
  message: any;
  name: string;
}

export interface IError {
  statusCode: number;
  message: string;
}
