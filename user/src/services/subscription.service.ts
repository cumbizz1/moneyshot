import { APIRequest } from './api-request';

class SubscriptionService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/subscriptions/performer/search', query));
  }

  userSearch(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/subscriptions/user/search', query));
  }

  searchPackage(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/package/subscription/search', query));
  }

  cancelSubscription() {
    return this.post('/subscriptions/cancel');
  }

  current() {
    return this.get('/subscriptions/current');
  }
}
export const subscriptionService = new SubscriptionService();
