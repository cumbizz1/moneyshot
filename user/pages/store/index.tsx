import '@components/performer/performer.module.less';

import { ShoppingCartOutlined } from '@ant-design/icons';
import { SearchFilter } from '@components/common/search-filter';
import ProductCard from '@components/product/product-card';
import { listProducts } from '@redux/product/actions';
import {
  Col, Layout, Pagination, Row, Spin
} from 'antd';
import Head from 'next/head';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IProduct, IUIConfig } from 'src/interfaces/';

interface IProps {
  productState: {
    requesting: boolean;
    error: any;
    success: boolean;
    items: IProduct[];
    total: number;
  };
  listProducts: Function;
  ui: IUIConfig;
}

interface IStates {
  offset: number;
  limit: number;
  filter: number;
}

class Products extends PureComponent<IProps, IStates> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  state = {
    offset: 0,
    limit: 12,
    filter: {} as any
  };

  componentDidMount() {
    const { listProducts: getListHandler } = this.props;
    const { limit, offset } = this.state;
    getListHandler({
      limit,
      offset
    });
  }

  async handleFilter(values: any) {
    const { listProducts: getListHandler } = this.props;
    const { limit, filter } = this.state;
    await this.setState({ offset: 0, filter: { ...filter, ...values } });
    getListHandler({
      limit,
      offset: 0,
      ...filter,
      ...values
    });
  }

  async pageChanged(page: number) {
    const { listProducts: getListHandler } = this.props;
    const { limit, filter } = this.state;
    await this.setState({ offset: page - 1 });
    getListHandler({
      limit,
      offset: (page - 1) * limit,
      ...filter
    });
  }

  render() {
    const {
      productState,
      ui
    } = this.props;
    const {
      requesting = true, total = 0, items = []
    } = productState;
    const {
      limit, offset
    } = this.state;
    const type = [
      {
        key: '',
        text: 'All type'
      },
      {
        key: 'physical',
        text: 'Physical'
      },
      {
        key: 'digital',
        text: 'Digital'
      }
    ];

    return (
      <Layout>
        <Head>
          <title>Store</title>
        </Head>
        <div className="main-container">
          <h3 className="page-heading" style={{ justifyContent: 'flex-start' }}>
            <span className="box">
              <ShoppingCartOutlined />
              {' '}
              Products
            </span>
            <span className="sub-box">{total}</span>
          </h3>
          <SearchFilter
            type={type}
            searchWithKeyword
            searchWithCategories
            categoryGroup="product"
            onSubmit={this.handleFilter.bind(this)}
          />
          <div className="main-background">
            <Row>
              {items && items.length > 0
                && !requesting
                && items.map((p) => (
                  <Col xs={12} md={6} lg={6} key={p._id}>
                    <ProductCard
                      product={p}
                      currencySymbol={ui.currencySymbol}
                    />
                  </Col>
                ))}
            </Row>
            {!total && !requesting && <p className="text-center">No product was found</p>}
            {requesting && <div className="text-center"><Spin /></div>}
            {total && total > limit ? (
              <div className="paging">
                <Pagination
                  current={offset + 1}
                  total={total}
                  pageSize={limit}
                  showSizeChanger={false}
                  onChange={this.pageChanged.bind(this)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  productState: { ...state.product.products },
  ui: { ...state.ui }
});

const mapDispatch = { listProducts };
export default connect(mapStates, mapDispatch)(Products);
