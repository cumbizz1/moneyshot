import { DollarOutlined, PictureOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { addCart } from '@redux/cart/actions';
import { Button, message } from 'antd';
import Link from 'next/link';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IProduct } from 'src/interfaces';

import style from './product-card.module.less';

interface IProps {
  product: IProduct;
  addCart: Function;
  cart: any;
  currencySymbol: string
}

class ProductCard extends PureComponent<IProps> {
  async onAddCart() {
    const {
      addCart: addCartHandler, product, cart
    } = this.props;
    if (cart.items && cart.items.length === 10) {
      message.error('You reached 10 items, please process payment first.');
      return;
    }
    const { stock, type } = product;
    if ((type === 'physical' && !stock) || (type === 'physical' && stock < 1)) {
      message.error('Out of stock');
      return;
    }
    let oldCart = localStorage.getItem('cart') as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];
    const addedProduct = oldCart && oldCart.find((c) => c._id === product?._id);
    if (addedProduct) {
      const { quantity } = addedProduct;
      if (type === 'physical' && quantity >= stock) {
        message.error('Out of stock');
        return;
      }
      if (type === 'digital') return;
    }
    message.success('Product is added to cart');
    addCartHandler([{ _id: product?._id, quantity: 1 }]);
    this.updateCartLocalStorage({ _id: product?._id, quantity: 1 });
  }

  onBuyNow() {
    this.onAddCart();
    setTimeout(() => { Router.push('/cart'); }, 1000);
  }

  updateCartLocalStorage(item: IProduct) {
    let oldCart = localStorage.getItem('cart') as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];

    let newCart = [...oldCart];
    const addedProduct = oldCart.find((c) => c._id === item._id);
    if (addedProduct) {
      const { quantity } = addedProduct;
      newCart = oldCart.map((_item) => {
        if (_item._id === addedProduct?._id) {
          return {
            ..._item,
            quantity: (quantity || 0) + 1
          };
        }

        return _item;
      });
    } else {
      newCart.push(item);
    }

    localStorage.setItem('cart', JSON.stringify(newCart));
  }

  render() {
    const { product, currencySymbol } = this.props;
    const thumbUrl = product?.images[0]?.thumbnails[0] || product?.images[0]?.url || '/empty_product.svg';
    return (
      <div className={style['prd-card']}>
        <div className="label-wrapper">
          {!product?.stock && product?.type === 'physical' && (
            <div className="label-wrapper-digital">Out of stock!</div>
          )}
          {product?.stock > 0 && product?.type === 'physical' && (
            <div className="label-wrapper-digital">
              {product?.stock}
              {' '}
              in stock
            </div>
          )}
          {product?.type === 'digital' && (
            <span className="label-wrapper-digital">Digital</span>
          )}
          {product?.price && (
            <span className="label-wrapper-price">
              {currencySymbol}
              {product?.price.toFixed(2)}
            </span>
          )}
        </div>
        <Link
          href={{ pathname: '/store/[id]', query: { id: product?.slug || product?._id } }}
          as={`/store/${product?.slug || product?._id}`}
        >
          <div>
            <div className="prd-thumb">
              <img alt="" src={thumbUrl} />
            </div>
            <div className="prd-info">
              <span className="prd-name">{product?.name}</span>
            </div>
          </div>
        </Link>
        <div className="no-of-images">
          <PictureOutlined />
          {' '}
          {(product?.images && product?.images.length) || 0}
        </div>
        <div className="prd-button">
          <Button
            className="primary"
            disabled={product?.type === 'physical' && !product?.stock}
            onClick={this.onAddCart.bind(this)}
          >
            <ShoppingCartOutlined />
            Add to Cart
          </Button>
          <Button className="primary" onClick={this.onBuyNow.bind(this)}>
            <DollarOutlined />
            Buy Now
          </Button>
        </div>
      </div>
    );
  }
}

const mapStates = (state: any) => ({
  cart: state.cart
});

const mapDispatch = {
  addCart
};

export default connect(mapStates, mapDispatch)(ProductCard);
