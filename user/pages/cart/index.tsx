import './cart.module.less';

import { ShoppingCartOutlined } from '@ant-design/icons';
import { CheckOutForm } from '@components/cart/form-checkout';
import { TableCart } from '@components/cart/table-cart';
import { Layout, message, Spin } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ICoupon, IProduct, IUIConfig } from 'src/interfaces';
import { removeCart } from 'src/redux/cart/actions';
import { cartService, paymentService, productService } from 'src/services';

interface IProps {
  removeCart: Function;
  ui: IUIConfig;
}

function mapQuantiy(items, existCart) {
  existCart.forEach((item) => {
    const index = items.findIndex((element) => element._id === item._id);
    // eslint-disable-next-line no-param-reassign
    if (index > -1) items[index].quantity = item.quantity;
  });
  return items;
}

class CartPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    products: [],
    coupon: null as ICoupon,
    isApplyCoupon: false,
    requesting: false,
    submiting: false,
    loading: false
  };

  async componentDidMount() {
    this.getProducts();
  }

  async handleApplyCoupon(couponCode: string) {
    try {
      const { isApplyCoupon } = this.state;
      if (isApplyCoupon) {
        this.setState({ isApplyCoupon: false, coupon: null });
        return;
      }
      await this.setState({ requesting: true });
      const resp = await paymentService.applyCoupon(couponCode);
      this.setState({
        isApplyCoupon: true,
        coupon: resp.data,
        requesting: false
      });
      message.success('Coupon is applied');
    } catch (error) {
      const e = await error;
      message.error(e?.message || 'Error occured, please try again later');
      this.setState({ requesting: false });
    }
  }

  async onChangeQuantity(item, quantity) {
    const { products } = this.state;
    const index = products.findIndex((element) => element._id === item._id);
    if (index > -1) {
      const newArray = [...products];
      newArray[index] = {
        ...newArray[index],
        quantity: quantity || 1
      };
      this.setState({ products: newArray });
    }
  }

  async onRemove(item) {
    const { removeCart: removeCartHandler } = this.props;
    const { products } = this.state;
    removeCartHandler([item]);
    this.removeItemCart(item);
    this.setState({ products: products.filter((product) => product._id !== item._id) });
  }

  async getProducts() {
    try {
      await this.setState({ loading: true });
      const existCart = await cartService.getCartItems();
      if (existCart && existCart.length > 0) {
        const itemIds = existCart.map((i) => i._id);
        const resp = await productService.userSearch({
          includedIds: itemIds,
          limit: 10
        });
        this.setState({
          products: mapQuantiy(resp.data.data, existCart),
          loading: false
        });
      } else {
        this.setState({ loading: false });
      }
    } catch (e) {
      message.error('An error occured, please try again later');
      this.setState({ loading: false });
    }
  }

  removeItemCart(product: IProduct) {
    let oldCart = localStorage.getItem('cart') as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];
    let newCart = [...oldCart];
    newCart = newCart.filter((item: IProduct) => item._id !== product._id);
    localStorage.setItem('cart', JSON.stringify(newCart));
  }

  async purchaseProducts(payload: {
    deliveryAddress: string;
    phoneNumber: string;
    postalCode: string;
    couponCode: string;
  }) {
    const {
      deliveryAddress, phoneNumber, postalCode, couponCode
    } = payload;
    try {
      const { products: prods } = this.state;
      await this.setState({ submiting: true });
      const products = prods.map((item) => ({
        quantity: item.quantity || 1,
        _id: item._id
      }));
      const data = {
        products,
        couponCode: couponCode || '',
        phoneNumber,
        postalCode,
        deliveryAddress
      };
      const resp = await (await paymentService.purchaseProducts(data)).data;
      message.info(
        'Redirecting to payment gateway, please do not reload page at this time',
        15
      );
      window.location.href = resp.paymentUrl;
    } catch (error) {
      const e = await error;
      message.error(e?.message || 'Error occured, please try again later');
      Router.push('/payment/cancel');
    }
  }

  render() {
    const { ui } = this.props;
    const {
      products, isApplyCoupon, coupon, requesting, submiting, loading
    } = this.state;

    return (
      <Layout>
        <Head>
          <title>Cart</title>
        </Head>
        <div className="main-container">
          <h3 className="page-heading">
            <span className="box">
              <ShoppingCartOutlined />
              {' '}
              Shopping Cart
            </span>
          </h3>
          {!loading && products && products.length > 0 && (
            <div className="table-responsive">
              <TableCart
                dataSource={products}
                rowKey="_id"
                onChangeQuantity={this.onChangeQuantity.bind(this)}
                onRemoveItemCart={this.onRemove.bind(this)}
                currency={ui.currency}
                currencySymbol={ui.currencySymbol}
              />
            </div>
          )}
          {!loading && products && products.length > 0 && (
            <CheckOutForm
              onFinish={this.purchaseProducts.bind(this)}
              products={products}
              submiting={submiting || requesting}
              coupon={coupon}
              isApplyCoupon={isApplyCoupon}
              onApplyCoupon={this.handleApplyCoupon.bind(this)}
              currency={ui.currency}
              currencySymbol={ui.currencySymbol}
            />
          )}
          {!loading && !products.length && (
            <p className="text-center">
              You have an empty cart,
              {' '}
              <Link href={{ pathname: '/store' }} as="/store/">
                <a className="text-link">let&apos;s go shopping</a>
              </Link>
            </p>
          )}
          {loading && (
            <div className="text-center">
              <Spin />
            </div>
          )}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  cart: state.cart,
  ui: state.ui
});

const mapDispatch = { removeCart };
export default connect(mapStates, mapDispatch)(CartPage);
