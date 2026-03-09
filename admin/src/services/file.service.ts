import { APIRequest } from './api-request';

export class FileService extends APIRequest {
  getFtpFiles() {
    return this.get('/files/ftp-folder');
  }
}

export const fileService = new FileService();
