import { createReducers } from '@lib/redux';
import { merge } from 'lodash';

import {
  getRelated, getRelatedFail,
  getRelatedSuccess, getVideos, getVideosFail, getVideosSuccess, moreVideo, moreVideoFail,
  moreVideoSuccess
} from './actions';

const initialState = {
  videos: {
    requesting: false,
    error: null,
    success: false,
    items: [],
    total: 0
  },
  relatedVideos: {
    requesting: false,
    error: null,
    success: false,
    items: [],
    total: 0
  }
};

const videoReducers = [
  {
    on: getVideos,
    reducer(state: any) {
      return {
        ...state,
        videos: {
          ...state.videos,
          requesting: true
        }
      };
    }
  },
  {
    on: getVideosSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        videos: {
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          success: true
        }
      };
    }
  },
  {
    on: getVideosFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        videos: {
          ...state.videos,
          requesting: false,
          error: data.payload
        }
      };
    }
  },
  {
    on: moreVideo,
    reducer(state: any) {
      return {
        ...state,
        videos: {
          ...state.videos,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: moreVideoSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        videos: {
          requesting: false,
          total: data.payload.total,
          items: [...state.videos.items, ...data.payload.data],
          success: true
        }
      };
    }
  },
  {
    on: moreVideoFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        videos: {
          ...state.videos,
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  },
  {
    on: getRelated,
    reducer(state: any) {
      return {
        ...state,
        relatedVideos: {
          ...state.videos,
          requesting: true
        }
      };
    }
  },
  {
    on: getRelatedSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        relatedVideos: {
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          success: true
        }
      };
    }
  },
  {
    on: getRelatedFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        relatedVideos: {
          ...state.videos,
          requesting: false,
          error: data.payload
        }
      };
    }
  }
];

export default merge({}, createReducers('video', [videoReducers], initialState));
