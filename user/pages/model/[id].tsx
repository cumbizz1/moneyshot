import {
  PictureOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { ScrollListGallery } from '@components/gallery/scroll-list-item';
import { PerformerInfo } from '@components/performer';
import { ScrollListVideo } from '@components/video';
import { redirect404 } from '@lib/utils';
import { getGalleries, moreGalleries } from '@redux/gallery/actions';
import {
  getVideos, moreVideo
} from '@redux/video/actions';
import {
  Image,
  Layout, Tabs
} from 'antd';
import Error from 'next/error';
import Head from 'next/head';
import nextCookie from 'next-cookies';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  ICountry, IError,
  IPerformer, IUIConfig
} from 'src/interfaces';
import { performerService, utilsService } from 'src/services';

import style from './profile-model.module.less';

interface IProps {
  error: IError;
  ui: IUIConfig;
  countries: ICountry[];
  performer: IPerformer;
  getVideos: Function;
  moreVideo: Function;
  getGalleries: Function;
  moreGalleries: Function;
  videoState: any;
  galleryState: any;
}

const { TabPane } = Tabs;

class PerformerProfile extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  static async getInitialProps(ctx) {
    try {
      const { token } = nextCookie(ctx);
      const { query } = ctx;
      const [performer, countries] = await Promise.all([
        performerService.findOne(query.id, {
          Authorization: token || ''
        }),
        utilsService.countriesList()
      ]);
      return {
        performer: performer?.data,
        countries: countries?.data || []
      };
    } catch {
      return redirect404(ctx);
    }
  }

  state = {
    itemPerPage: 24,
    videoPage: 0,
    galleryPage: 0,
    activeTab: 'video'
  };

  async componentDidMount() {
    this.loadItems();
  }

  loadItems = () => {
    const { itemPerPage, activeTab } = this.state;
    const {
      performer,
      getGalleries: getGalleriesHandler,
      getVideos: getVideosHandler
    } = this.props;
    switch (activeTab) {
      case 'video':
        this.setState({ videoPage: 0 });
        getVideosHandler({
          limit: itemPerPage,
          offset: 0,
          performerId: performer._id
        });
        break;
      case 'gallery':
        this.setState({ galleryPage: 0 });
        getGalleriesHandler({
          limit: itemPerPage,
          offset: 0,
          performerId: performer._id
        });
        break;
      default: break;
    }
  };

  loadMoreItem = async () => {
    const {
      moreVideo: moreVideoHandler,
      videoState,
      moreGalleries: moreGalleryHandler,
      galleryState,
      performer
    } = this.props;
    const {
      videoPage, itemPerPage, galleryPage, activeTab
    } = this.state;
    if (activeTab === 'video') {
      if (videoState.items.length >= videoState.total) {
        return;
      }
      this.setState({ videoPage: videoPage + 1 });
      moreVideoHandler({
        limit: itemPerPage,
        offset: (videoPage + 1) * itemPerPage,
        performerId: performer._id
      });
    }
    if (activeTab === 'gallery') {
      if (galleryState.items.length >= galleryState.total) {
        return;
      }
      this.setState({ galleryPage: galleryPage + 1 });
      moreGalleryHandler({
        limit: itemPerPage,
        offset: (galleryPage + 1) * itemPerPage,
        performerId: performer._id
      });
    }
  };

  render() {
    const {
      error, performer, ui, videoState, galleryState, countries
    } = this.props;
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Profile was not found'} />;
    }
    const { items: videos = [], total: totalVideos = 0, requesting: loadingVid = true } = videoState;
    const { items: galleries = [], total: totalGalleries = 0, requesting: loadingGallery = true } = galleryState;
    const {
      activeTab
    } = this.state;
    const pageTitle = `${ui?.siteName} | ${performer?.username}`;
    return (
      <Layout>
        <Head>
          <title>{pageTitle}</title>
          <meta
            name="keywords"
            content={`${performer?.username}, ${performer?.name}`}
          />
          <meta name="description" content={performer?.bio} />
          {/* OG tags */}
          <meta
            property="og:title"
            content={`${ui?.siteName} | ${performer?.username}`}
            key="title"
          />
          <meta property="og:image" content={performer?.avatar || ui?.logoUrl} />
          <meta
            property="og:keywords"
            content={`${performer?.username}, ${performer?.name}`}
          />
          <meta
            property="og:description"
            content={performer?.bio}
          />
          {/* Twitter tags */}
          <meta
            name="twitter:title"
            content={`${ui?.siteName} | ${performer?.name || performer?.username || ''}`}
          />
          <meta name="twitter:image" content={performer?.avatar || ui?.logoUrl} />
          <meta
            name="twitter:description"
            content={performer?.bio}
          />
        </Head>
        <div className="main-container">
          <div className={style['top-profile']} style={{ backgroundImage: `url(${performer?.cover || '/banner-image.jpg'})` }}>
            <div className="bg-top">
              <div className="top-left">
                <Image src={performer?.avatar || '/no-avatar.png'} fallback="/no-avatar.png" />
                <div className="m-name">
                  <h2>
                    {performer?.name || 'N/A'}
                  </h2>
                  <h5>
                    @
                    {performer?.username || 'n/a'}
                  </h5>
                </div>
              </div>
            </div>
          </div>
          <div className={style['pro-desc']}>
            <PerformerInfo countries={countries || []} performer={performer && performer} />
          </div>
          <div className={style['model-content']}>
            <Tabs
              defaultActiveKey="video"
              activeKey={activeTab}
              size="large"
              onTabClick={(tab) => {
                this.setState({ activeTab: tab }, () => this.loadItems());
              }}
            >
              <TabPane
                tab={(
                  <span>
                    <VideoCameraOutlined />
                    VIDEOS
                  </span>
                )}
                key="video"
              >
                <ScrollListVideo
                  items={videos}
                  loading={loadingVid}
                  canLoadmore={videos && videos.length < totalVideos}
                  loadMore={this.loadMoreItem.bind(this)}
                  currencySymbol={ui.currencySymbol}
                />
              </TabPane>
              <TabPane
                tab={(
                  <span>
                    <PictureOutlined />
                    GALLERIES
                  </span>
                )}
                key="gallery"
              >
                <ScrollListGallery
                  items={galleries}
                  loading={loadingGallery}
                  canLoadmore={galleries && galleries.length < totalGalleries}
                  loadMore={this.loadMoreItem.bind(this)}
                  currencySymbol={ui.currencySymbol}
                />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui,
  videoState: { ...state.video.videos },
  galleryState: { ...state.gallery.galleries }
});

const mapDispatch = {
  getVideos,
  moreVideo,
  getGalleries,
  moreGalleries
};
export default connect(mapStates, mapDispatch)(PerformerProfile);
