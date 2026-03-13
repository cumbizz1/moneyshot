import { APIRequest } from './api-request';

export class PerformerService extends APIRequest {
  search(query?: { [key: string]: any }) {
    return this.get(this.buildUrl('/performers/search', query));
  }

  findOne(id: string, headers?: { [key: string]: string }) {
    return this.get(`/performers/${encodeURI(id)}`, headers);
  }
}

export const performerService = new PerformerService();
