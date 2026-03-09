import { createReducers } from '@lib/redux';
import { merge } from 'lodash';

import { updateSettings } from './actions';

// TODO -
const initialState = {
};

const settingReducers = [
  {
    on: updateSettings,
    reducer(state: any, data: any) {
      return {
        ...data.payload
      };
    }
  }
];

export default merge({}, createReducers('settings', [settingReducers], initialState));
