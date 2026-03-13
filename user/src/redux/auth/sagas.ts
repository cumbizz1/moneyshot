import { createSagas } from '@lib/redux';
import { message } from 'antd';
import { flatten } from 'lodash';
import Router from 'next/router';
import { put } from 'redux-saga/effects';
import {
  ILogin
} from 'src/interfaces';
import { authService, userService } from 'src/services';

import { updateCurrentUser } from '../user/actions';
import {
  login,
  loginFail,
  loginSuccess,
  logout
} from './actions';

const authSagas = [
  {
    on: login,
    * worker(data: any) {
      try {
        const payload = data.payload as ILogin;
        const resp = (yield authService.login(payload)).data;
        // store token, update store and redirect to dashboard page
        yield authService.setToken(resp.token);
        const userResp = (yield userService.me()).data;
        yield put(updateCurrentUser(userResp));
        yield put(loginSuccess());
        Router.push('/home');
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error?.message || 'Incorrect credentials!');
        yield put(loginFail(error));
      }
    }
  },
  {
    on: logout,
    * worker() {
      yield authService.removeToken();
      message.success('Log out!');
      Router.push('/auth/login');
    }
  }
];

export default flatten([createSagas(authSagas)]);
