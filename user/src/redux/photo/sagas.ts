import { createSagas } from '@lib/redux';
import { photoService } from '@services/index';
import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { IReduxAction } from 'src/interfaces';

import {
  getPhotos,
  getPhotosFail,
  getPhotosSuccess
} from './actions';

const photoSagas = [
  {
    on: getPhotos,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield photoService.searchByUser(data.payload);
        yield put(getPhotosSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(getPhotosFail(error));
      }
    }
  }
];

export default flatten([createSagas(photoSagas)]);
