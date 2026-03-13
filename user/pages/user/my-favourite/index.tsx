import GalleryCard from '@components/gallery/gallery-card';
import { ProPagination } from '@components/pagination';
import { VideoCard } from '@components/video';
import {
  Col, Layout, message, Row, Select,
  Spin
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';
import { reactionService } from 'src/services';

interface IProps {
  ui: IUIConfig;
}

class FavouriteVideoPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    loading: false,
    type: 'video',
    items: [],
    offset: 0,
    limit: 12,
    total: 0
  };

  componentDidMount() {
    this.getFavourites();
  }

  async handleChangeType(type: string) {
    await this.setState({
      type, items: [], total: 0, offset: 0
    });
    this.getFavourites();
  }

  async handlePagechange(page: number) {
    await this.setState({ offset: page - 1 });
    this.getFavourites();
  }

  async getFavourites() {
    try {
      const { limit, offset, type } = this.state;
      this.setState({ loading: true });
      const query = {
        limit,
        offset: offset * limit,
        action: 'favourite'
      };
      const resp = type === 'video' ? await reactionService.getVideos(query)
        : await reactionService.getGalleries(query);
      this.setState({
        loading: false,
        items: resp.data.data,
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
      loading, items, limit, total, type
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>My Favourite</title>
        </Head>
        <div className="main-container">
          <h3 className="page-heading">
            <a>
              <span className="box">My Favourite</span>
              <span className="sub-box">{total}</span>
            </a>
            <Select style={{ width: '100px' }} value={type} onChange={(val) => this.handleChangeType(val)}>
              <Select.Option value="video" key="video">Video</Select.Option>
              <Select.Option value="gallery" key="gallery">Gallery</Select.Option>
            </Select>
          </h3>
          <Row>
            {items && items.length > 0 && !loading
              && items.map((item) => {
                if (!item?.objectInfo) return null;
                return (
                  <Col xs={12} sm={12} md={6} lg={6} key={item._id}>
                    {type === 'gallery' && <GalleryCard gallery={item?.objectInfo} currencySymbol={ui.currencySymbol} />}
                    {type === 'video' && <VideoCard video={item?.objectInfo} currencySymbol={ui.currencySymbol} />}
                  </Col>
                );
              })}
          </Row>
          {(!loading && !items.length) && (
            <div className="text-center">
              No data was found
            </div>
          )}
          {loading && <div className="text-center"><Spin /></div>}
          {total > limit && (
            <div className="paging">
              <ProPagination
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
export default connect(mapState)(FavouriteVideoPage);
