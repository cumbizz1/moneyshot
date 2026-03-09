import './video.module.less';

import { VideoCameraOutlined } from '@ant-design/icons';
import { SearchFilter } from '@components/common/search-filter';
import { GridListVideo } from '@components/video';
import { videoService } from '@services/video.service';
import {
  Layout, message, Pagination, Spin
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces/';

interface IProps {
  ui: IUIConfig;
}

class Videos extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  state = {
    offset: 0,
    limit: 12,
    filter: {
      sortBy: 'popular'
    } as any,
    items: [],
    totalItems: 0,
    loading: true,
    type: ''
  };

  async componentDidMount() {
    this.search();
  }

  async handleFilter(values: any) {
    const { filter } = this.state;
    await this.setState({ offset: 0, filter: { ...filter, ...values } });
    this.search();
  }

  async handleSwitchType(type: string) {
    const isSchedule = type !== 'upcoming' ? '' : true;
    const isSale = type !== 'ppv' ? '' : true;
    await this.setState({ offset: 0, filter: { isSchedule, isSale }, type });
    this.search();
  }

  async pageChanged(page: number) {
    await this.setState({ offset: page - 1 });
    this.search();
  }

  async search() {
    const {
      limit, offset, filter
    } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await videoService.userSearch({
        limit,
        offset: offset * limit,
        ...filter
      });
      this.setState({ items: resp.data.data, totalItems: resp.data.total, loading: false });
    } catch (error) {
      message.error(error.message || 'An error occurred, please try again!');
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { ui } = this.props;
    const {
      limit, offset, items, totalItems, loading, type
    } = this.state;

    return (
      <Layout>
        <Head>
          <title>
            Videos
          </title>
        </Head>
        <div className="main-container">
          <div className="page-heading custom">
            <span aria-hidden className={type === '' ? 'box active' : 'box'} onClick={() => this.handleSwitchType('')}>
              <VideoCameraOutlined />
              {' '}
              ALL VIDEOS
            </span>
            <span aria-hidden className={type === 'ppv' ? 'box active custom' : 'box custom'} onClick={() => this.handleSwitchType('ppv')}>
              PPV VIDEOS
            </span>
            <span aria-hidden className={type === 'upcoming' ? 'box active custom' : 'box custom'} onClick={() => this.handleSwitchType('upcoming')}>
              UPCOMING VIDEOS
            </span>
            <span className="sub-box">{totalItems}</span>
          </div>
          <SearchFilter
            searchWithKeyword
            searchWithCategories
            searchWithPerformer
            showSort
            categoryGroup="video"
            onSubmit={this.handleFilter.bind(this)}
          />
          <div className="main-background">
            <GridListVideo videos={items} currencySymbol={ui.currencySymbol} />
            {!totalItems && !loading && <p className="text-center">No video was found.</p>}
            {loading && <div className="text-center"><Spin /></div>}
            {totalItems && totalItems > limit && !loading ? (
              <div className="paging">
                <Pagination
                  current={offset + 1}
                  total={totalItems}
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
  ui: { ...state.ui }
});

const mapDispatch = {};
export default connect(mapStates, mapDispatch)(Videos);
