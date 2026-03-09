import { createAction, createAsyncAction } from '@lib/redux';

export const { login, loginSuccess, loginFail } = createAsyncAction(
  'login',
  'LOGIN'
);

export const { forgot, forgotSuccess, forgotFail } = createAsyncAction(
  'forgot',
  'FORGOT'
);

export const logout = createAction('logout');
