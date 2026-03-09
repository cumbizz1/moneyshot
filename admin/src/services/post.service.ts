import { IPostCreate, IPostSearch, IPostUpdate } from 'src/interfaces';

import { APIRequest } from './api-request';

export class PostService extends APIRequest {
  create(payload: IPostCreate, image?: any) {
    if (image) {
      return this.upload('/admin/posts', [{
        file: image,
        fieldname: 'image'
      }], {
        onProgress() {},
        customData: payload,
        method: 'POST'
      });
    }
    return this.post('/admin/posts', payload);
  }

  search(query: IPostSearch) {
    return this.get(this.buildUrl('/admin/posts/search', query as any));
  }

  findById(id: string) {
    return this.get(`/admin/posts/${id}/view`);
  }

  update(id: string, payload: IPostUpdate, image?: any) {
    if (image) {
      return this.upload(`/admin/posts/${id}`, [{
        file: image,
        fieldname: 'image'
      }], {
        onProgress() {},
        customData: payload,
        method: 'PUT'
      });
    }
    return this.put(`/admin/posts/${id}`, payload);
  }

  delete(id: string) {
    return this.del(`/admin/posts/${id}`);
  }
}

export const postService = new PostService();
