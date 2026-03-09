import { APIRequest } from './api-request';

class CategoriesService extends APIRequest {
  userSearch(param?: any) {
    return this.get(this.buildUrl('/user/assets/categories/search', param));
  }
}

export const categoriesService = new CategoriesService();
