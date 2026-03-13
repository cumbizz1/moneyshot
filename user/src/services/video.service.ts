import { APIRequest } from './api-request';

export class VideoService extends APIRequest {
  userSearch(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/user/assets/videos/search', query)
    );
  }

  findById(id: string, headers?: { [key: string]: string }) {
    return this.get(`/performer/assets/videos/${encodeURI(id)}/view`, headers);
  }

  findOne(id: string, headers?: { [key: string]: string }) {
    return this.get(`/user/assets/videos/${encodeURI(id)}`, headers);
  }
}

export const videoService = new VideoService();
