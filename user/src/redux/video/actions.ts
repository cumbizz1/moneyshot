import { createAsyncAction } from '@lib/redux';

export const {
  getVideos,
  getVideosSuccess,
  getVideosFail
} = createAsyncAction('getVideos', 'GET_VIDEOS');

export const {
  moreVideo, moreVideoSuccess, moreVideoFail
} = createAsyncAction('moreVideo', 'LOAD_MORE');

export const {
  getRelated, getRelatedSuccess, getRelatedFail
} = createAsyncAction('getRelated', 'GET_RELATED');
