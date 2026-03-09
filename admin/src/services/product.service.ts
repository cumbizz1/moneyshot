import { APIRequest } from './api-request';

export class ProductService extends APIRequest {
  create(
    files: [{ fieldname: string; file: File }],
    payload: any,
    onProgress?: Function
  ) {
    return this.upload('/admin/assets/products', files, {
      onProgress,
      customData: payload
    });
  }

  uploadImage(
    file: File,
    payload: any,
    onProgress?: Function
  ) {
    return this.upload('/admin/assets/products/image', [{
      fieldname: 'image',
      file
    }], {
      onProgress,
      customData: payload
    });
  }

  update(
    id: string,
    files: [{ fieldname: string; file: File }],
    payload: any,
    onProgress?: Function
  ) {
    return this.upload(`/admin/assets/products/${id}`, files, {
      onProgress,
      customData: payload,
      method: 'PUT'
    });
  }

  search(query?: { [key: string]: any }) {
    return this.get(
      this.buildUrl('/admin/assets/products/search', query)
    );
  }

  findById(id: string) {
    return this.get(`/admin/assets/products/${id}/view`);
  }

  delete(id: string) {
    return this.del(`/admin/assets/products/${id}`);
  }
}

export const productService = new ProductService();
