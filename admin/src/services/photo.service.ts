import { APIRequest } from './api-request';
import { getGlobalConfig } from './config';

export class PhotoService extends APIRequest {
  uploadPhoto(file: File, payload: any, onProgress?: Function) {
    return this.upload(
      '/admin/assets/photos/upload',
      [
        {
          fieldname: 'photo',
          file
        }
      ],
      {
        onProgress,
        customData: payload
      }
    );
  }

  ftpUpload(payload) {
    return this.post('/admin/assets/photos/ftp-create', payload);
  }

  getUploadUrl() {
    const config = getGlobalConfig();
    return `${config.NEXT_PUBLIC_API_ENDPOINT}/admin/assets/photos/upload`;
  }

  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/admin/assets/photos/search', query)
    );
  }

  findById(id: string) {
    return this.get(`/admin/assets/photos/${id}/view`);
  }

  update(id: string, payload: any) {
    return this.put(`/admin/assets/photos/${id}`, payload);
  }

  delete(id: string) {
    return this.del(`/admin/assets/photos/${id}`);
  }

  setCoverGallery(id: string) {
    return this.post(`/admin/assets/photos/set-cover/${id}`);
  }
}

export const photoService = new PhotoService();
