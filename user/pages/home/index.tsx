/* eslint-disable react/no-danger */
import './index.module.less';

import { Banner } from '@components/common';
import { HomePerformers } from '@components/performer';
import { HomeListVideo } from '@components/video/home-list';
import { IBanner, IUIConfig } from '@interfaces/index';
import storeHolder from '@lib/storeHolder';
import {
  bannerService,
  performerService, postService, videoService
} from '@services/index';
import { Layout } from 'antd';
import Head from 'next/head';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

interface IProps {
  ui: IUIConfig;
  settings: any;
  banners: IBanner[];
  homeContent: {
    content: string;
    title: string;
    image: any;
  };
}

class HomePage extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect = true;

  static async getInitialProps() {
    const store = storeHolder.getStore();
    const { settings } = store.getState() as any;
    let homeContent = null;
    let banners = null;
    if (settings?.homeContentPageId) {
      try {
        homeContent = await postService.findById(settings?.homeContentPageId);
        banners = await bannerService.search({ limit: 99 });
      // eslint-disable-next-line no-empty
      } catch {}
    }
    return {
      homeContent: {
        content: homeContent?.data?.content,
        title: homeContent?.data?.title,
        image: homeContent?.data?.image
      },
      banners: banners?.data?.data || []
    };
  }

  state = {
    fetching: true,
    performers: [],
    recentVideos: [],
    upComingVideos: []
  };

  componentDidMount() {
    this.getInitialData();
  }

  async getInitialData() {
    try {
      await this.setState({ fetching: true });
      const [performers, recentVideos, upComingVideos] = await Promise.all([
        performerService.search({ limit: 24, sort: 'desc', sortBy: 'score' }),
        videoService.userSearch({ limit: 24, isSchedule: false }),
        videoService.userSearch({ limit: 24, isSchedule: true })
      ]);
      this.setState({
        performers: performers.data.data,
        recentVideos: recentVideos.data.data,
        upComingVideos: upComingVideos.data.data,
        fetching: false
      });
    } catch {
      this.setState({ fetching: false });
    }
  }

  render() {
    const {
      banners, ui, homeContent, settings
    } = this.props;
    const {
      performers, recentVideos, upComingVideos, fetching
    } = this.state;

    const topBanners = banners.filter((b) => b.position === 'top');
    const middleBanners = banners.filter((b) => b.position === 'middle');
    const bottomBanners = banners.filter((b) => b.position === 'bottom');
    const pageTitle = `${ui.siteName || ''} | Home`;

    return (
      <Layout>
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <div className="home-page">
          <div>
            <div className="main-container">
              {topBanners && topBanners.length > 0 && (
                <div className="banner">
                  <Banner banners={topBanners} autoplay autoplaySpeed={(settings?.bannerAutoplaySpeed || 5) * 1000} arrows={false} dots />
                </div>
              )}
              <h3 className="page-heading">
                <span className="box">RECENT VIDEOS</span>
              </h3>
              <HomeListVideo videos={recentVideos} loading={fetching} currencySymbol={ui.currencySymbol} />
              <div className="term-welcome custom">
                <div className="left-group custom">
                  <h1 className="title">{homeContent?.title || 'Welcome'}</h1>
                  {homeContent?.content && <div className="content" dangerouslySetInnerHTML={{ __html: homeContent?.content }} />}
                </div>
                <div className="right-group custom" style={{ backgroundImage: `url(${homeContent?.image?.url || '/bg-home.jpeg'})` }}>
                  <span>18+ Warning</span>
                </div>
              </div>
              {middleBanners && middleBanners.length > 0 && (
                <Banner banners={middleBanners} arrows autoplay autoplaySpeed={(settings?.bannerAutoplaySpeed || 5) * 1000} />
              )}
              <h3 className="page-heading">
                <span className="box">UPCOMING VIDEOS</span>
              </h3>
              <HomeListVideo videos={upComingVideos} loading={fetching} currencySymbol={ui.currencySymbol} />
              {bottomBanners && bottomBanners.length > 0 && (
                <Banner banners={bottomBanners} arrows autoplay autoplaySpeed={(settings?.bannerAutoplaySpeed || 5) * 1000} />
              )}
              <h3 className="page-heading">
                <span className="box">MODELS</span>
              </h3>
              <HomePerformers performers={performers} loading={fetching} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui,
  settings: state.settings
});

const mapDispatch = { };
export default connect(mapStates, mapDispatch)(HomePage);
