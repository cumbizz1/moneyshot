import { APIRequest } from './api-request';

export class GalleryService extends APIRequest {
  create(payload: any) {
    return this.post('/admin/assets/galleries', payload);
  }

  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/admin/assets/galleries/search', query)
    );
  }

  findById(id: string) {
    return this.get(`/admin/assets/galleries/${id}/view`);
  }

  update(id: string, payload: any) {
    return this.put(`/admin/assets/galleries/${id}`, payload);
  }

  delete(id: string) {
    return this.del(`/admin/assets/galleries/${id}`);
  }
}

export const galleryService = new GalleryService();
