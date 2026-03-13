import { createAsyncAction } from '@lib/redux';

export const {
  getPhotos,
  getPhotosSuccess,
  getPhotosFail
} = createAsyncAction('getVideos', 'GET_PHOTOS');
