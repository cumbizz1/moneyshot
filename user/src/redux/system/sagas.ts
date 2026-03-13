import { createSagas } from '@lib/redux';
import { flatten } from 'lodash';
import Router from 'next/router';
import { call, put } from 'redux-saga/effects';
import { IReduxAction } from 'src/interfaces';

import { redirectToErrorPage, setErrorSystem } from './actions';

const systemSagas = [
  {
    on: redirectToErrorPage,
    * worker(data: IReduxAction<any>) {
      try {
        const { url, error } = data.payload;
        yield put(setErrorSystem(error));
        yield call(Router.push, url);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const error = yield Promise.resolve(e);
      }
    }
  }
];

export default flatten([createSagas(systemSagas)]);
