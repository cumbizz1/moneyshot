import './index.module.less';

import {
  CalendarOutlined, EyeOutlined, HeartOutlined, LikeOutlined,
  PictureOutlined
} from '@ant-design/icons';
import GalleryCard from '@components/gallery/gallery-card';
import PhotoPreviewList from '@components/photo/photo-preview-list';
import { formatDate, shortenLargeNumber } from '@lib/index';
import { getRelatedGalleries } from '@redux/gallery/actions';
import { galleryService, photoService, reactionService } from '@services/index';
import {
  Avatar,
  Button, Col, Layout, List, message, Pagination, Row, Spin, Tabs, Tag
} from 'antd';
import Error from 'next/error';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IError, IGallery, IPerformer,
  IUIConfig, IUser
} from 'src/interfaces';

interface IProps {
  gallery: IGallery;
  error: IError;
  user: IUser;
  ui: IUIConfig;
  getRelatedGalleries: Function;
  relatedGalleries: any;
}

const initialState = {
  fetching: false,
  photos: [],
  total: 0,
  offset: 0,
  limit: 40,
  isFavourited: false,
  isLiked: false,
  totalLikes: 0,
  totalFavourites: 0
};

export async function getServerSideProps(ctx) {
  try {
    const { query } = ctx;
    const token = ctx.req.cookies?.token;
    const gallery = (await (
      await galleryService.findById(query.id, {
        Authorization: token || ''
      })
    ).data);
    return {
      props: {
        gallery
      }
    };
  } catch (e) {
    return {
      props: {
        error: await e
      }
    };
  }
}

class GalleryViewPage extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  state = { ...initialState };

  async componentDidMount() {
    document.addEventListener('contextmenu', (event) => event.preventDefault());
    this.onStateChange();
  }

  async componentDidUpdate(prevProps) {
    const { gallery } = this.props;
    if (prevProps?.gallery?._id !== gallery?._id) {
      this.onStateChange();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('contextmenu', (event) => event.preventDefault());
  }

  async onStateChange() {
    const { gallery, getRelatedGalleries: getRelatedHandler } = this.props;
    await this.setState({
      ...initialState,
      isLiked: gallery?.isLiked,
      isFavourited: gallery?.isFavourited,
      totalLikes: gallery?.stats?.likes,
      totalFavourites: gallery?.stats?.favourites
    });
    this.getPhotos();
    getRelatedHandler({
      excludedId: gallery._id,
      limit: 24
    });
  }

  getPhotos = async () => {
    const { gallery } = this.props;
    const { offset, limit } = this.state;
    try {
      await this.setState({ fetching: true });
      const resp = await (await photoService.searchByUser({
        targetId: gallery._id,
        limit,
        offset: limit * offset
      })).data;
      this.setState({
        photos: resp.data,
        total: resp.total,
        fetching: false
      });
      // preload image
      resp.data.forEach((img) => {
        img?.photo?.url && setTimeout(() => { new Image().src = img?.photo?.url; }, 1000);
        return img;
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error on getting photos, please try again later');
      this.setState({ fetching: false });
    }
  };

  onReaction = async (action: string) => {
    const { gallery, user } = this.props;
    if (!user || !user._id) {
      message.error('Please login');
      return;
    }
    const {
      totalFavourites, totalLikes, isLiked, isFavourited
    } = this.state;
    try {
      const postData = {
        objectId: gallery._id,
        action,
        objectType: 'gallery'
      };
      switch (action) {
        case 'like': isLiked ? await reactionService.delete(postData) : await reactionService.create(postData);
          break;
        case 'favourite': isFavourited ? await reactionService.delete(postData) : await reactionService.create(postData);
          break;
        default: break;
      }
      if (action === 'like') {
        this.setState({
          totalLikes: totalLikes + (isLiked ? -1 : 1),
          isLiked: !isLiked
        });
      }
      if (action === 'favourite') {
        this.setState({
          totalFavourites: totalFavourites + (isFavourited ? -1 : 1),
          isFavourited: !isFavourited
        });
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    }
  };

  handlePageChange = async (page) => {
    await this.setState({ offset: page - 1 });
    this.getPhotos();
  };

  render() {
    const {
      error,
      ui,
      gallery,
      user,
      relatedGalleries = {
        requesting: true,
        error: null,
        success: false,
        items: []
      }
    } = this.props;
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Gallery was not found'} />;
    }
    const {
      fetching, photos, total, offset, limit, isFavourited, totalFavourites, totalLikes, isLiked
    } = this.state;
    const pageTitle = `${gallery?.name || 'Gallery'}`;
    return (
      <Layout>
        <Head>
          <title>{pageTitle}</title>
          <meta name="keywords" content={gallery?.description} />
          <meta name="description" content={gallery?.description} />
          {/* OG tags */}
          <meta
            property="og:title"
            content={pageTitle}
            key="title"
          />
          <meta property="og:image" content={gallery?.coverPhoto?.url} />
          <meta property="og:keywords" content={gallery?.description || ui?.logoUrl} />
          <meta
            property="og:description"
            content={gallery?.description}
          />
          {/* twitter tags */}
          <meta
            name="twitter:title"
            content={pageTitle}
          />
          <meta name="twitter:image" content={gallery?.coverPhoto?.url || ui?.logoUrl} />
          <meta
            name="twitter:description"
            content={gallery?.description}
          />
        </Head>
        <div className="main-container">
          <h3 className="page-heading" style={{ justifyContent: 'flex-start' }}>
            <span className="box">
              <PictureOutlined />
              {' '}
              {gallery?.name}
            </span>
            <span className="sub-box">{total}</span>
          </h3>
          <div className="page-sub-head">
            <span>
              <EyeOutlined />
              {' '}
              {shortenLargeNumber(gallery?.stats?.views)}
            </span>
            <span>
              <CalendarOutlined />
              {' '}
              {formatDate(gallery?.createdAt, 'll')}
            </span>
          </div>
          <div className="photo-carousel">
            {photos && photos.length > 0 && <PhotoPreviewList isBlur={!user || !user._id || !user.isSubscribed} photos={photos} />}
            {!fetching && !photos.length && <p className="text-center mar-10">No photo was found.</p>}
            {fetching && <div className="text-center mar-10"><Spin /></div>}
            {!fetching && total > photos.length && (
              <div className="text-center mar-10">
                <Pagination
                  showQuickJumper
                  current={offset + 1}
                  total={total}
                  pageSize={limit}
                  onChange={this.handlePageChange.bind(this)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </div>
        </div>
        <div className="middle-split">
          <div className="main-container">
            <div className="act-btns">
              <Button
                className={isLiked ? 'react-btn active' : 'react-btn'}
                onClick={() => this.onReaction('like')}
              >
                <LikeOutlined />
                <span>
                  Like (
                  {shortenLargeNumber(totalLikes)}
                  )
                </span>
              </Button>
              <Button
                className={isFavourited ? 'react-btn active' : 'react-btn'}
                onClick={() => this.onReaction('favourite')}
              >
                <HeartOutlined />
                <span>
                  Favourite (
                  {shortenLargeNumber(totalFavourites)}
                  )
                </span>
              </Button>
            </div>
            {gallery?.categories && gallery?.categories.length > 0 && (
              <div className="tags">
                Categories:
                &nbsp;
                {gallery?.categories.map((cate) => (
                  <Tag key={cate._id}>
                    <Link href={{ pathname: '/search', query: { categoryId: cate._id } }} as={`/search?categoryId=${cate._id}`}>
                      <a>
                        {cate.name || cate.slug}
                      </a>
                    </Link>
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="vid-information">
          <div className="main-container">
            <Tabs
              defaultActiveKey="description"
              className="vid-tabs"
            >
              <Tabs.TabPane tab="Description" key="description">
                <p style={{ whiteSpace: 'pre-line' }}>{gallery?.description || 'No description'}</p>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Performers" key="participants">
                <List
                  itemLayout="horizontal"
                  dataSource={gallery?.performers || []}
                  renderItem={(per: IPerformer) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar size={40} src={per?.avatar || '/no-avatar.png'} />}
                        title={(
                          <Link
                            key={per._id}
                            href={{
                              pathname: '/model/[id]',
                              query: { id: per?.username || per?._id }
                            }}
                            as={`/model/${per?.username || per?._id}`}
                          >
                            <a>{per?.name}</a>
                          </Link>
                        )}
                        description={per?.bio || 'No bio'}
                      />
                    </List.Item>
                  )}
                />
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
        <div className="main-container">
          <div className="related-items">
            <h4 className="ttl-1">You may also like</h4>
            {relatedGalleries.requesting && <div><Spin /></div>}
            {!relatedGalleries.requesting && !relatedGalleries.items.length && <p>No gallery was found</p>}
            <Row>
              {!relatedGalleries.requesting && relatedGalleries.items.length > 0
                && relatedGalleries.items.map((item: IGallery) => (
                  <Col xs={12} sm={12} md={6} lg={6} key={item._id}>
                    <GalleryCard gallery={item} currencySymbol={ui.currencySymbol} />
                  </Col>
                ))}
            </Row>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  user: { ...state.user.current },
  ui: { ...state.ui },
  relatedGalleries: { ...state.gallery.relatedGalleries }
});

const mapDispatch = {
  getRelatedGalleries
};
export default connect(mapStates, mapDispatch)(GalleryViewPage);
