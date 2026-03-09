import './index.module.less';

import {
  PictureOutlined
} from '@ant-design/icons';
import { SearchFilter } from '@components/common/search-filter';
import GalleryCard from '@components/gallery/gallery-card';
import { galleryService } from '@services/gallery.service';
import {
  Col, Layout, message, Pagination, Row, Spin
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces/';

interface IProps {
  ui: IUIConfig;
}

class Galleries extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  state = {
    offset: 0,
    limit: 12,
    filter: {} as any,
    items: [],
    totalItems: 0,
    loading: true
  };

  async componentDidMount() {
    this.search();
  }

  async handleFilter(values: any) {
    const { filter } = this.state;
    // eslint-disable-next-line react/no-access-state-in-setstate
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search() {
    const { limit, offset, filter } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await galleryService.userSearch({
        limit,
        offset: offset * limit,
        ...filter
      });
      this.setState({ items: resp.data.data, totalItems: resp.data.total, loading: false });
    } catch (error) {
      message.error(error.message || 'An error occurred, please try again!');
      this.setState({ loading: false });
    }
  }

  async pageChanged(page: number) {
    await this.setState({ offset: page - 1 });
    this.search();
  }

  render() {
    const {
      ui
    } = this.props;
    const {
      limit, offset, items, totalItems, loading
    } = this.state;

    return (
      <Layout>
        <Head>
          <title>Galleries</title>
        </Head>
        <div className="main-container">
          <h3 className="page-heading" style={{ justifyContent: 'flex-start' }}>
            <span className="box">
              <PictureOutlined />
              {' '}
              Galleries
            </span>
            <span className="sub-box">
              {totalItems}
            </span>
          </h3>
          <SearchFilter
            searchWithKeyword
            searchWithPerformer
            searchWithCategories
            showSort
            categoryGroup="gallery"
            onSubmit={this.handleFilter.bind(this)}
          />
          <div className="main-background">
            <Row>
              {items && items.length > 0 && !loading
                && items.map((item) => (
                  <Col xs={12} sm={12} md={6} lg={6} key={item._id}>
                    <GalleryCard gallery={item} currencySymbol={ui.currencySymbol} />
                  </Col>
                ))}
            </Row>
            {!totalItems && !loading && <p className="text-center">No gallery was found.</p>}
            {loading && <div className="text-center"><Spin /></div>}
            {totalItems && totalItems > limit && !loading ? (
              <div className="paging">
                <Pagination
                  current={offset + 1}
                  total={totalItems}
                  pageSize={limit}
                  onChange={this.pageChanged.bind(this)}
                  showSizeChanger={false}
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
  ui: { ...state.ui }
});

export default connect(mapStates)(Galleries);
