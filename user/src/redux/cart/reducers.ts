import { createReducers } from '@lib/redux';
import { merge } from 'lodash';
import { IProduct } from 'src/interfaces/product';

import {
  addCart, clearCart,
  removeCart, updateItemCart
} from './actions';

const initialState = {
  total: 0,
  items: []
};

const cartReducers = [
  {
    on: addCart,
    reducer(state: any, data: any) {
      let total = 0;
      let valid = true;
      data.payload.forEach((item) => {
        if (state.items.findIndex((i) => i._id === item._id) > -1) {
          valid = false;
        }
        total += 1;
      });
      if (!valid) {
        return {
          ...state
        };
      }
      return {
        ...state,
        total: state.total + total,
        items: [...state.items, ...data.payload]
      };
    }
  },
  {
    on: removeCart,
    reducer(state: any, data: any) {
      return {
        ...state,
        total: state.total - (data.payload || []).length,
        items: [
          ...state.items.filter(
            (item: IProduct) => data.payload.indexOf(item) > -1
          )
        ]
      };
    }
  },
  {
    on: clearCart,
    reducer() {
      return {
        ...initialState
      };
    }
  },
  {
    on: updateItemCart,
    reducer(state: any, data: any) {
      const index = state.items.findIndex(
        (element) => element._id === data.payload.data._id
      );
      const newArray = [...state.items];
      if (index > -1) {
        newArray[index] = {
          ...newArray[index],
          quantity: data.payload.quantity || 1
        };
      }
      let total = 0;
      newArray.forEach(({ quantity }) => {
        total += quantity;
      });

      return {
        ...state,
        items: newArray,
        total
      };
    }
  }
];

export default merge({}, createReducers('cart', [cartReducers], initialState));
