import { APIRequest } from './api-request';

export class PhotoService extends APIRequest {
  searchByUser(query?: {[key: string]: any}) {
    return this.get(
      this.buildUrl('/user/assets/photos', query)
    );
  }

  searchPhotosInGallery(id: string, query?: {[key: string]: any}) {
    return this.get(this.buildUrl(`/user/assets//gallery/${id}/photos`, query));
  }
}

export const photoService = new PhotoService();
