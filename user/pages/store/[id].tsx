import {
  DollarOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { PerformerListProduct } from '@components/product/performer-list-product';
import { addCart, removeCart } from '@redux/cart/actions';
import { productService } from '@services/index';
import {
  Button, Carousel, Image as AntImage, Layout, message, Spin, Tabs
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IProduct, IUIConfig } from 'src/interfaces';

import style from './store.module.less';

interface IProps {
  addCart: Function;
  cart: any;
  ui: IUIConfig;
  id: string;
}

class ProductViewPage extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  static async getInitialProps(ctx) {
    return ctx.query;
  }

  state = {
    fetching: true,
    product: {} as IProduct,
    relatedProducts: [],
    openPreviewImage: false,
    previewIndex: 0
  };

  componentDidMount() {
    this.getProduct();
  }

  componentDidUpdate(prevProps) {
    const { id } = this.props;
    if (prevProps.id !== id) {
      this.getProduct();
    }
  }

  onAddCart() {
    const {
      addCart: addCartHandler, cart
    } = this.props;
    const { product } = this.state;
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

  async getProduct() {
    const { id } = this.props;
    try {
      await this.setState({ fetching: true });
      const [product, relatedProducts] = await Promise.all([
        productService.userView(id),
        productService.userSearch({
          limit: 24,
          excludedId: id
        })
      ]);
      if (product) {
        this.setState({ product: product.data, fetching: false });
        // preload images
        product.data && product.data.images && product.data.images.forEach((img) => {
          setTimeout(() => { new Image().src = img?.url; }, 1000);
          return img;
        });
      }
      if (relatedProducts) {
        this.setState({ relatedProducts: relatedProducts.data.data, fetching: false });
      }
    } catch (e) {
      message.error('Error occured, could not get product details');
      Router.back();
    }
  }

  updateCartLocalStorage(item: IProduct) {
    let oldCart = localStorage.getItem('cart') as any;
    oldCart = oldCart && oldCart.length ? JSON.parse(oldCart) : [];

    let newCart = [...oldCart];
    const addedProduct = oldCart.find((c) => c._id === item._id);
    if (addedProduct) {
      const { quantity } = addedProduct;
      newCart = oldCart.map((_item) => {
        if (_item._id === addedProduct._id) {
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
    const { ui } = this.props;
    const {
      product, relatedProducts, fetching, previewIndex, openPreviewImage
    } = this.state;
    return (
      <Layout>
        <Head>
          <title>{`${product?.name || 'Product'}`}</title>
          <meta name="keywords" content={product?.description} />
          <meta name="description" content={product?.description} />
          {/* OG tags */}
          <meta
            property="og:title"
            content={`${ui.siteName} | ${product?.name || 'Product'}`}
            key="title"
          />
          <meta property="og:image" content={(product?.images && product?.images[0]) || ui?.logoUrl} />
          <meta property="og:keywords" content={product?.description} />
          <meta
            property="og:description"
            content={product?.description}
          />
          {/* twitter tags */}
          <meta
            name="twitter:title"
            content={`${ui?.siteName} | ${product?.name || 'Product'}`}
          />
          <meta name="twitter:image" content={(product?.images && product?.images[0]) || ui?.logoUrl} />
          <meta
            name="twitter:description"
            content={product?.description}
          />
        </Head>
        <div className="prod-main">
          <div className="main-container">
            <div className={style['product-card']}>
              {product && !fetching && (
                <>
                  <div className="prod-img">
                    <Carousel autoplay={false} swipeToSlide arrows dots={false}>
                      {product.images && product.images.length > 0 ? product.images.map((image, index) => (
                        <AntImage
                          key={image._id}
                          src={image?.thumbnails[0] || image?.url}
                          fallback="/no-image.jpg"
                          preview={{ visible: false }}
                          title={image.name}
                          onClick={() => this.setState({ openPreviewImage: true, previewIndex: index })}
                        />
                      ))
                        : <img alt="prod-thumb" src="/empty_product.svg" />}
                    </Carousel>
                    <div style={{ display: 'none' }}>
                      <AntImage.PreviewGroup preview={{ current: previewIndex, visible: openPreviewImage, onVisibleChange: (vis) => this.setState({ openPreviewImage: vis }) }}>
                        {product.images && product.images.length > 0 && product.images.map((image) => <AntImage key={image._id} src={image?.thumbnails[0] || image?.url} preview={{ src: image?.url || image?.thumbnails[0] }} />)}
                      </AntImage.PreviewGroup>
                    </div>
                    {product.type === 'physical' && product.stock && (
                      <span className="prod-stock">
                        {product.stock}
                        {' '}
                        in stock
                      </span>
                    )}
                    {product.type === 'physical' && !product.stock && (
                      <span className="prod-stock">Out of stock!</span>
                    )}
                    <span className="prod-digital">{product.type}</span>
                  </div>
                  <div className={style['prod-info']}>
                    <div className="prod-name">{product.name}</div>
                    <div className="add-cart">
                      <p className={style['prod-price']}>
                        {ui.currencySymbol}
                        {product.price.toFixed(2)}
                      </p>
                      <Button
                        className="primary"
                        disabled={product.type === 'physical' && !product.stock}
                        onClick={this.onAddCart.bind(this)}
                      >
                        <ShoppingCartOutlined />
                        {' '}
                        Add to Cart
                      </Button>
                      &nbsp;
                      <Button type="link" className="secondary" onClick={this.onBuyNow.bind(this)}>
                        <DollarOutlined />
                        {' '}
                        Buy now
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {fetching && <div className="text-center"><Spin /></div>}
            </div>
          </div>
        </div>
        <div className="vid-information">
          <div className="main-container">
            <Tabs
              defaultActiveKey="description"
              className="vid-tabs"
            >
              <Tabs.TabPane tab="Description" key="description">
                <p style={{ whiteSpace: 'pre-line' }}>{product?.description || 'No description'}</p>
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
        <div className="main-container">
          <div className="related-items">
            <h4 className="ttl-1">You may also like</h4>
            {!fetching && relatedProducts.length > 0 && (
              <PerformerListProduct products={relatedProducts} currencySymbol={ui.currencySymbol} />
            )}
            {!fetching && !relatedProducts?.length && <p>No product was found</p>}
            {fetching && <div><Spin /></div>}
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  cart: { ...state.cart },
  ui: state.ui
});

const mapDispatch = { addCart, removeCart };
export default connect(mapStates, mapDispatch)(ProductViewPage);
