import { merge } from 'lodash';
import { combineReducers } from 'redux';

import auth from './auth/reducers';
// load reducer here
import ui from './ui/reducers';
import user from './user/reducers';

const reducers = merge(ui, user, auth);

export default combineReducers(reducers);
