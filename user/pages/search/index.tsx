import {
  PictureOutlined, SearchOutlined, ShoppingCartOutlined,
  StarOutlined, VideoCameraOutlined
} from '@ant-design/icons';
import GalleryCard from '@components/gallery/gallery-card';
import PerformerCard from '@components/performer/card';
import ProductCard from '@components/product/product-card';
import { VideoCard } from '@components/video';
import {
  categoriesService, galleryService, performerService, productService,
  searchService, videoService
} from '@services/index';
import {
  Col, Input,
  Layout, Pagination, Row, Select, Spin, Tag
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';

import style from './index.module.less';

interface IProps {
  totalPerformers: number;
  totalVideos: number;
  totalGalleries: number;
  totalProducts: number;
  q: string;
  categoryId: string;
  ui: IUIConfig;
}

const initialState = {
  type: 'video',
  categories: [],
  fetchingCategories: false,
  fetchingData: false,
  limit: 12,
  performers: {
    offset: 0,
    total: 0,
    data: []
  },
  videos: {
    offset: 0,
    total: 0,
    data: []
  },
  galleries: {
    offset: 0,
    total: 0,
    data: []
  },
  products: {
    offset: 0,
    total: 0,
    data: []
  },
  activeCategoryIds: []
};

class ProductViewPage extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  static async getInitialProps(ctx) {
    const { q = '', categoryId = '' } = ctx.query;
    const resp = await searchService.countTotal({ q, categoryId });
    return {
      ...ctx.query,
      ...resp.data
    };
  }

  state = { ...initialState };

  async componentDidMount() {
    const {
      totalVideos, totalProducts, totalPerformers, totalGalleries, categoryId
    } = this.props;
    if (totalVideos) {
      await this.setState({ activeCategoryIds: categoryId ? [categoryId] : [] });
      this.getVideos();
    }
    if (!totalVideos && totalPerformers) {
      this.setState({ type: 'performer', activeCategoryIds: categoryId ? [categoryId] : [] });
      this.getPerformers();
    }
    if (!totalVideos && !totalPerformers && totalGalleries) {
      this.setState({ type: 'gallery', activeCategoryIds: categoryId ? [categoryId] : [] });
      this.getGalleries();
    }
    if (!totalVideos && !totalPerformers && !totalGalleries && totalProducts) {
      this.setState({ type: 'product', activeCategoryIds: categoryId ? [categoryId] : [] });
      this.getProducts();
    }
    this.getCategories();
  }

  async componentDidUpdate(prevProps) {
    const { q } = this.props;
    if (prevProps.q !== q) {
      // eslint-disable-next-line react/no-did-update-set-state
      await this.setState({ ...initialState });
      this.getVideos();
      this.countTotal(q);
    }
  }

  async handleFilterByCategory(categoryId: string) {
    const {
      activeCategoryIds, performers, videos, galleries, products, type
    } = this.state;
    if (activeCategoryIds.includes(categoryId)) {
      await this.setState({ activeCategoryIds: activeCategoryIds.filter((id) => id !== categoryId) });
    }
    if (!activeCategoryIds.includes(categoryId)) {
      await this.setState({ activeCategoryIds: activeCategoryIds.concat([categoryId]) });
    }
    if (type === 'video') {
      await this.setState({ videos: { ...videos, offset: 0 } });
      this.getVideos();
    }
    if (type === 'gallery') {
      await this.setState({ galleries: { ...galleries, offset: 0 } });
      this.getGalleries();
    }
    if (type === 'product') {
      await this.setState({ products: { ...products, offset: 0 } });
      this.getProducts();
    }
    if (type === 'performer') {
      await this.setState({ performers: { ...performers, offset: 0 } });
      this.getPerformers();
    }
  }

  async getPerformers() {
    try {
      const { q = '' } = this.props;
      const { performers, activeCategoryIds, limit } = this.state;
      await this.setState({ fetchingData: true });
      const resp = await performerService.search({
        q,
        categoryIds: activeCategoryIds,
        limit,
        offset: limit * performers.offset
      });
      this.setState({
        performers: { ...performers, data: resp.data.data, total: resp.data.total },
        fetchingData: false
      });
    } catch {
      this.setState({ fetchingData: false });
    }
  }

  async getVideos() {
    try {
      const { q = '' } = this.props;
      const { videos, activeCategoryIds, limit } = this.state;
      await this.setState({ fetchingData: true });
      const resp = await videoService.userSearch({
        q,
        categoryIds: activeCategoryIds,
        limit,
        offset: limit * videos.offset
      });
      this.setState({
        videos: { ...videos, data: resp.data.data, total: resp.data.total },
        fetchingData: false
      });
    } catch {
      this.setState({ fetchingData: false });
    }
  }

  async getGalleries() {
    try {
      const { q = '' } = this.props;
      const { galleries, activeCategoryIds, limit } = this.state;
      await this.setState({ fetchingData: true });
      const resp = await galleryService.userSearch({
        q,
        categoryIds: activeCategoryIds,
        limit,
        offset: limit * galleries.offset
      });
      this.setState({
        galleries: { ...galleries, data: resp.data.data, total: resp.data.total },
        fetchingData: false
      });
    } catch {
      this.setState({ fetchingData: false });
    }
  }

  async getProducts() {
    try {
      const { q = '' } = this.props;
      const { products, activeCategoryIds, limit } = this.state;
      await this.setState({ fetchingData: true });
      const resp = await productService.userSearch({
        q,
        categoryIds: activeCategoryIds,
        limit,
        offset: limit * products.offset
      });
      this.setState({
        products: { ...products, data: resp.data.data, total: resp.data.total },
        fetchingData: false
      });
    } catch {
      this.setState({ fetchingData: false });
    }
  }

  async getCategories() {
    try {
      const { type } = this.state;
      await this.setState({ fetchingCategories: true });
      const resp = await categoriesService.userSearch({
        group: type,
        limit: 200
      });
      this.setState({ categories: resp.data.data, fetchingCategories: false });
    } catch {
      this.setState({ fetchingCategories: false });
    }
  }

  async countTotal(q = '', categoryId = '') {
    const resp = await searchService.countTotal({ q, categoryId });
    this.setState({
      ...resp.data
    });
  }

  async pageChanged(page) {
    const {
      type, performers, videos, galleries, products
    } = this.state;
    if (type === 'video') {
      await this.setState({ videos: { ...videos, offset: page - 1 } });
      this.getVideos();
    }
    if (type === 'gallery') {
      await this.setState({ galleries: { ...galleries, offset: page - 1 } });
      this.getGalleries();
    }
    if (type === 'product') {
      await this.setState({ products: { ...products, offset: page - 1 } });
      this.getProducts();
    }
    if (type === 'performer') {
      await this.setState({ performers: { ...performers, offset: page - 1 } });
      this.getPerformers();
    }
  }

  async typeChanged(type) {
    const {
      performers, videos, galleries, products
    } = this.state;
    await this.setState({ type, activeCategoryIds: [] });
    if (type === 'video') {
      await this.setState({ videos: { ...videos, offset: 0 } });
      this.getVideos();
    }
    if (type === 'gallery') {
      await this.setState({ galleries: { ...galleries, offset: 0 } });
      this.getGalleries();
    }
    if (type === 'product') {
      await this.setState({ products: { ...products, offset: 0 } });
      this.getProducts();
    }
    if (type === 'performer') {
      await this.setState({ performers: { ...performers, offset: 0 } });
      this.getPerformers();
    }
    this.getCategories();
  }

  render() {
    const {
      ui, q = '', totalGalleries = 0, totalPerformers = 0, totalProducts = 0, totalVideos = 0
    } = this.props;
    const {
      categories, fetchingCategories, fetchingData, performers, videos, galleries, products, type, limit, activeCategoryIds
    } = this.state;
    const totalResult = totalGalleries + totalPerformers + totalProducts + totalVideos;
    return (
      <Layout>
        <Head>
          <title>Search</title>
        </Head>
        <div className="main-container">
          <div className={style['search-lg-top']}>
            <Input.Search enterButton defaultValue={q} onSearch={(keyword) => Router.replace({ pathname: '/search', query: { q: keyword } })} onPressEnter={(e: any) => Router.replace({ pathname: '/search', query: { q: e.target.value } })} />
          </div>
          <div className="page-heading">
            <span className="box">
              <SearchOutlined />
              {' '}
              {q && `'${q}'`}
              {' '}
              {totalResult}
              {' '}
              results
            </span>
            <Select value={type} onSelect={this.typeChanged.bind(this)}>
              <Select.Option value="video">
                <VideoCameraOutlined />
                {' '}
                Video (
                {videos.total || totalVideos}
                )
              </Select.Option>
              <Select.Option value="gallery">
                <PictureOutlined />
                {' '}
                Gallery (
                {galleries.total || totalGalleries}
                )
              </Select.Option>
              <Select.Option value="product">
                <ShoppingCartOutlined />
                {' '}
                Product (
                {products.total || totalProducts}
                )
              </Select.Option>
              <Select.Option value="performer">
                <StarOutlined />
                {' '}
                Model (
                {performers.total || totalPerformers}
                )
              </Select.Option>
            </Select>
          </div>
          <div className={style['cate-group']}>
            Categories:
            {!fetchingCategories && categories.length > 0 && categories.map((cate) => (
              <Tag
                key={cate._id}
                className={activeCategoryIds.includes(cate._id) ? 'cate-item active' : 'cate-item'}
                onClick={() => this.handleFilterByCategory(cate._id)}
              >
                {cate.name || cate.slug}
              </Tag>
            ))}
          </div>
          <Row>
            {type === 'performer' && !fetchingData && performers.data.length > 0 && performers.data.map((per) => (
              <Col md={6} xs={12} key={per._id}>
                <PerformerCard performer={per} />
              </Col>
            ))}
            {type === 'video' && !fetchingData && videos.data.length > 0 && videos.data.map((video) => (
              <Col md={6} xs={12} key={video._id}>
                <VideoCard video={video} currencySymbol={ui.currencySymbol} />
              </Col>
            ))}
            {type === 'gallery' && !fetchingData && galleries.data.length > 0 && galleries.data.map((gallery) => (
              <Col md={6} xs={12} key={gallery._id}>
                <GalleryCard gallery={gallery} currencySymbol={ui.currencySymbol} />
              </Col>
            ))}
            {type === 'product' && !fetchingData && products.data.length > 0 && products.data.map((product) => (
              <Col md={6} xs={12} key={product._id}>
                <ProductCard product={product} currencySymbol={ui.currencySymbol} />
              </Col>
            ))}
          </Row>

          {type === 'video' && !fetchingData && !videos.total && <div className="text-center">No video was found</div>}
          {type === 'gallery' && !fetchingData && !galleries.total && <div className="text-center">No gallery was found</div>}
          {type === 'product' && !fetchingData && !products.total && <div className="text-center">No product was found</div>}
          {type === 'performers' && !fetchingData && !performers.total && <div className="text-center">No model was found</div>}
          {fetchingData && <div className="text-center"><Spin /></div>}
          {type === 'video' && !fetchingData && videos.total > videos.data.length ? (
            <div className="paging">
              <Pagination
                current={videos.offset + 1}
                total={videos.total}
                pageSize={limit}
                onChange={this.pageChanged.bind(this)}
                showSizeChanger={false}
              />
            </div>
          ) : null}
          {type === 'gallery' && !fetchingData && galleries.total > galleries.data.length ? (
            <div className="paging">
              <Pagination
                current={galleries.offset + 1}
                total={galleries.total}
                pageSize={limit}
                onChange={this.pageChanged.bind(this)}
                showSizeChanger={false}
              />
            </div>
          ) : null}
          {type === 'product' && !fetchingData && products.total > products.data.length ? (
            <div className="paging">
              <Pagination
                current={products.offset + 1}
                total={products.total}
                pageSize={limit}
                onChange={this.pageChanged.bind(this)}
                showSizeChanger={false}
              />
            </div>
          ) : null}
          {type === 'performer' && !fetchingData && performers.total > performers.data.length ? (
            <div className="paging">
              <Pagination
                current={performers.offset + 1}
                total={performers.total}
                pageSize={limit}
                onChange={this.pageChanged.bind(this)}
                showSizeChanger={false}
              />
            </div>
          ) : null}
        </div>
      </Layout>
    );
  }
}
const mapStates = (state: any) => ({
  user: state.user.current,
  ui: state.ui
});

export default connect(mapStates)(ProductViewPage);
