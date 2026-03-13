import { APIRequest } from './api-request';

export class ProductService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/performer/assets/products/search', query)
    );
  }

  userSearch(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/user/assets/products/search', query)
    );
  }

  userView(id: string) {
    return this.get(`/user/assets/products/${encodeURI(id)}`);
  }

  findById(id: string) {
    return this.get(`/performer/assets/products/${encodeURI(id)}/view`);
  }
}

export const productService = new ProductService();
