import { GridListVideo } from '@components/video';
import {
  Layout, message, Pagination, Spin
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';
import { reactionService } from 'src/services';

interface IProps {
  ui: IUIConfig;
}

class WatchLateVideoPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    loading: true,
    watchLateVideos: [],
    offset: 0,
    limit: 12,
    total: 0
  };

  componentDidMount() {
    this.getWatchLateVideos();
  }

  async handlePagechange(page: number) {
    await this.setState({ offset: page - 1 });
    this.getWatchLateVideos();
  }

  async getWatchLateVideos() {
    try {
      const { limit, offset } = this.state;
      const resp = await reactionService.getVideos({
        limit,
        offset: offset * limit,
        action: 'watch_later'
      });
      await this.setState({
        loading: false,
        watchLateVideos: resp.data.data,
        total: resp.data.total
      });
    } catch (error) {
      const err = await error;
      message.error(err?.message || 'Error occured, please try again later');
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      loading, watchLateVideos, limit, total
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>My wishlist</title>
        </Head>
        <div className="main-container">
          <h3 className="page-heading" style={{ justifyContent: 'flex-start' }}>
            <span className="box">My Wishlist</span>
            <span className="sub-box">{total}</span>
          </h3>
          <GridListVideo videos={watchLateVideos.map((p) => p?.objectInfo)} currencySymbol={ui.currencySymbol} />
          {(!loading && !watchLateVideos.length) && (
            <div className="text-center">
              No data was found
            </div>
          )}
          {loading && <div className="text-center"><Spin /></div>}
          {total > limit && (
            <div className="paging">
              <Pagination
                showQuickJumper={false}
                defaultCurrent={1}
                total={total}
                pageSize={limit}
                onChange={this.handlePagechange.bind(this)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </Layout>
    );
  }
}
const mapState = (state: any) => ({ ui: state.ui });
export default connect(mapState)(WatchLateVideoPage);
