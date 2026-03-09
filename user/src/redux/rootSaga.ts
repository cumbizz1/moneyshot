import { all, spawn } from 'redux-saga/effects';

import authSagas from './auth/sagas';
import bannerSagas from './banner/sagas';
import commentSagas from './comment/sagas';
import gallerySagas from './gallery/sagas';
import performerSagas from './performer/sagas';
import productSagas from './product/sagas';
import systemSagas from './system/sagas';
import userSagas from './user/sagas';
import videoSagas from './video/sagas';

function* rootSaga() {
  yield all(
    [
      ...authSagas,
      ...userSagas,
      ...performerSagas,
      ...videoSagas,
      ...productSagas,
      ...commentSagas,
      ...gallerySagas,
      ...bannerSagas,
      ...systemSagas
    ].map(spawn)
  );
}

export default rootSaga;
