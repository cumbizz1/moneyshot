import { APIRequest } from './api-request';

class GalleryService extends APIRequest {
  userSearch(param?: any) {
    return this.get(this.buildUrl('/user/assets/galleries/search', param));
  }

  findById(id: string, headers: any) {
    return this.get(`/user/assets/galleries/${encodeURI(id)}/view`, headers);
  }
}

export const galleryService = new GalleryService();
