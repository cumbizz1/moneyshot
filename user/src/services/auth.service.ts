import cookie from 'js-cookie';
import {
  IFanRegister, IForgot,
  ILogin
} from 'src/interfaces';

import { APIRequest, TOKEN } from './api-request';

export class AuthService extends APIRequest {
  public async login(data: ILogin) {
    return this.post('/auth/login', data);
  }

  public async verifyEmail(data) {
    return this.post('/auth/email-verification', data);
  }

  setToken(token: string, remember = true): void {
    const expired = { expires: !remember ? 1 : 365 };
    cookie.set(TOKEN, token, expired);
    this.setAuthHeaderToken(token);
  }

  getToken(): string {
    return cookie.get(TOKEN);
  }

  removeToken(): void {
    cookie.remove(TOKEN);
  }

  updatePassword(password: string, source?: string) {
    return this.put('/auth/users/me/password', { password, source });
  }

  resetPassword(data: IForgot) {
    return this.post('/auth/users/forgot', data);
  }

  register(data: IFanRegister) {
    return this.post('/auth/users/register', data);
  }

  resendEmailVerification(email: string) {
    return this.post('/auth/email-verification/resend', { email });
  }
}

export const authService = new AuthService();
