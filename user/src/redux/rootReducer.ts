import { combineReducers } from '@reduxjs/toolkit';
import { merge } from 'lodash';

import auth from './auth/reducers';
import banner from './banner/reducers';
import cart from './cart/reducers';
import comment from './comment/reducers';
import gallery from './gallery/reducers';
import performer from './performer/reducers';
import photo from './photo/reducers';
import product from './product/reducers';
// load reducer here
import settings from './settings/reducers';
import system from './system/reducers';
import ui from './ui/reducers';
import user from './user/reducers';
import video from './video/reducers';

const reducers = merge(
  settings,
  ui,
  user,
  auth,
  performer,
  gallery,
  video,
  photo,
  product,
  comment,
  cart,
  banner,
  system
);

export default combineReducers(reducers);
