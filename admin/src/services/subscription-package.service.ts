import { ISubscriptionPackageCreate } from '../interfaces/subscription-package';
import { APIRequest } from './api-request';

class SubscriptionPackageService extends APIRequest {
  create(payload: ISubscriptionPackageCreate) {
    return this.post('/admin/package/subscription', payload);
  }

  list(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/admin/package/subscription/search', query));
  }

  update(id: string, payload: ISubscriptionPackageCreate) {
    return this.put(`/admin/package/subscription/${id}`, payload);
  }

  delete(id: string) {
    return this.del(`/admin/package/subscription/${id}`);
  }

  findOne(id: string) {
    return this.get(`/admin/package/subscription/${id}/view`);
  }
}
export const subscriptionPackageService = new SubscriptionPackageService();
