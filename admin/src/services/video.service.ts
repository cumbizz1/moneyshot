import { APIRequest } from './api-request';

export class VideoService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/admin/assets/videos/search', query)
    );
  }

  findById(id: string) {
    return this.get(`/admin/assets/videos/${id}/view`);
  }

  update(
    id: string,
    files: [{ fieldname: string; file: File }],
    payload: any,
    onProgress?: Function
  ) {
    return this.upload(`/admin/assets/videos/${id}`, files, {
      onProgress,
      customData: payload,
      method: 'PUT'
    });
  }

  ftpUpload(payload) {
    return this.post('/admin/assets/videos/ftp-create', payload);
  }

  ftpUpdate(payload, id) {
    return this.put(`/admin/assets/videos/ftp-update/${id}`, payload);
  }

  uploadVideo(
    files: [{ fieldname: string; file: File }],
    payload: any,
    onProgress?: Function
  ) {
    return this.upload('/admin/assets/videos/upload', files, {
      onProgress,
      customData: payload
    });
  }

  delete(id: string) {
    return this.del(`/admin/assets/videos/${id}`);
  }
}

export const videoService = new VideoService();
