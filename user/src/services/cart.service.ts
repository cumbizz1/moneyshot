import { IProduct } from 'src/interfaces';

export class CartService {
  getCartItems() {
    let existCart = localStorage.getItem('cart') as any;
    existCart = existCart && existCart.length ? (JSON.parse(existCart) as IProduct) : [];
    return existCart;
  }
}

export const cartService = new CartService();
