/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-prototype-builtins */
import {
  ArrowRightOutlined, CalendarOutlined, ClockCircleOutlined,
  CommentOutlined, EyeOutlined, HeartOutlined, HourglassOutlined, LikeOutlined, NotificationOutlined
} from '@ant-design/icons';
import { CommentForm, ListComments } from '@components/comment';
import Loader from '@components/common/base/loader';
import CuroMethodSelect from '@components/payment/curo-method-select';
import PhotoPreviewList from '@components/photo/photo-preview-list';
import { SubscriptionPackage } from '@components/subscription/line-card';
import {
  VideoPlayer
} from '@components/video';
import { PurchaseVideoForm } from '@components/video/confirm-purchase';
import { VideoCard } from '@components/video/video-card';
import { formatDate, shortenLargeNumber, videoDuration } from '@lib/index';
import {
  paymentService, photoService,
  reactionService, subscriptionService, videoService
} from '@services/index';
import {
  Alert, Avatar, Button, Col,
  Input, Layout, List, message, Modal, Radio, Row, Space,
  Spin, Tabs, Tag
} from 'antd';
import moment from 'moment';
import Error from 'next/error';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  ICoupon, IError,
  IPerformer, IUIConfig, IUser, IVideo
} from 'src/interfaces';
import {
  createComment, deleteComment,
  getComments, moreComment
} from 'src/redux/comment/actions';
import { getRelated } from 'src/redux/video/actions';

import style from './video.module.less';

const { TabPane } = Tabs;

interface IProps {
  error: IError;
  user: IUser;
  relatedVideos: any;
  commentMapping: any;
  comment: any;
  getRelated: Function;
  getComments: Function;
  moreComment: Function;
  createComment: Function;
  ui: IUIConfig;
  video: IVideo;
  deleteComment: Function;
  updateBalance: Function;
  curoEnabled: boolean;
  ccbillEnabled: boolean;
}

const initialState = {
  videoStats: {
    likes: 0, comments: 0, views: 0, favourites: 0, wishlist: 0
  },
  isLiked: false,
  isFavourited: false,
  isWatchedLater: false,
  itemPerPage: 24,
  commentPage: 0,
  submiting: false,
  openPurchaseModal: false,
  activeTab: 'description',
  fetching: false,
  photos: [],
  requesting: false,
  couponCode: '',
  isApplyCoupon: false,
  coupon: null as ICoupon,
  paymentGateway: '',
  membershipPlans: [],
  curoMethod: 'creditcard'
};

export async function getServerSideProps(context) {
  try {
    const { query } = context;
    const token = context.req.cookies?.token;
    const headers = {} as any;
    if (token) headers.Authorization = token;
    const video = (await (
      await videoService.findOne(query.id, headers)
    ).data);
    return {
      props: {
        video
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

class VideoViewPage extends PureComponent<IProps, typeof initialState> {
  static authenticate: boolean = true;

  static noredirect = true;

  constructor(props) {
    super(props);

    const { ccbillEnabled, curoEnabled } = props;
    let paymentGateway = '';
    if (ccbillEnabled) paymentGateway = 'ccbill';
    else if (curoEnabled) paymentGateway = 'curo';
    this.state = {
      ...initialState,
      membershipPlans: [],
      paymentGateway
    };
  }

  componentDidMount() {
    const { video, getRelated: handleGetRelated } = this.props;
    const { itemPerPage } = this.state;
    this.handleUpdateProps();
    this.getMembershipPlans();
    handleGetRelated({
      excludedId: video._id,
      limit: itemPerPage
    });
  }

  componentDidUpdate(prevProps) {
    const {
      video, getRelated: handleGetRelated
    } = this.props;
    const { itemPerPage } = this.state;
    if (prevProps?.video?._id !== video._id) {
      this.handleUpdateProps();
      handleGetRelated({
        excludedId: video._id,
        limit: itemPerPage
      });
    }
  }

  handleUpdateProps() {
    const { video } = this.props;
    this.setState({
      ...initialState,
      paymentGateway: this.state.paymentGateway,
      curoMethod: this.state.curoMethod,
      videoStats: video?.stats,
      isLiked: video?.isLiked,
      isFavourited: video?.isFavourited,
      isWatchedLater: video?.isWatchedLater
    });
  }

  async onReaction(
    action: string
  ) {
    const { video, user } = this.props;
    if (!user || !user._id) {
      message.error('Please login');
      return;
    }
    const {
      videoStats, isLiked, isWatchedLater, isFavourited
    } = this.state;
    try {
      let react = null;
      const postData = {
        objectId: video._id,
        action,
        objectType: 'video'
      };
      switch (action) {
        case 'like': react = isLiked ? await (await reactionService.delete(postData)).data : await (await reactionService.create(postData)).data;
          break;
        case 'favourite': react = isFavourited ? await (await reactionService.delete(postData)).data : await (await reactionService.create(postData)).data;
          break;
        case 'watch_later': react = isWatchedLater ? await (await reactionService.delete(postData)).data : await (await reactionService.create(postData)).data;
          break;
        default: break;
      }
      if (react) {
        if (action === 'like') {
          this.setState({
            isLiked: !isLiked,
            videoStats: {
              ...videoStats,
              likes: videoStats.likes + (!isLiked ? 1 : -1)
            }
          });
        }
        if (action === 'favourite') {
          this.setState({
            isFavourited: !isFavourited,
            videoStats: {
              ...videoStats,
              favourites: videoStats.favourites + (!isFavourited ? 1 : -1)
            }
          });
        }
        if (action === 'watch_later') {
          this.setState({
            isWatchedLater: !isWatchedLater,
            videoStats: {
              ...videoStats,
              wishlist: videoStats.wishlist + (!isWatchedLater ? 1 : -1)
            }
          });
        }
      }
    } catch (e) {
      const error = await e;
      message.error(error.message || 'Error occured, please try again later');
    }
  }

  async onChangeTab(tab: string) {
    const { itemPerPage, activeTab } = this.state;
    const { getComments: handleGetComments, video } = this.props;
    if (tab === activeTab) return;
    await this.setState({ activeTab: tab });
    if (tab === 'comment') {
      this.setState(
        {
          commentPage: 0
        },
        () => {
          handleGetComments({
            objectId: video._id,
            objectType: 'video',
            limit: itemPerPage,
            offset: 0
          });
        }
      );
    }
    if (tab === 'photo') {
      this.getPhotos();
    }
  }

  async onSubmitComment(values: any) {
    const { createComment: handleComment } = this.props;
    handleComment(values);
  }

  async getMembershipPlans() {
    try {
      await this.setState({ fetching: true });
      const resp = await (await subscriptionService.searchPackage({ limit: 99 })).data;
      this.setState({ membershipPlans: resp.data, fetching: false });
    } catch {
      this.setState({ fetching: false });
    }
  }

  async getPhotos() {
    try {
      const { video } = this.props;
      await this.setState({ fetching: true });
      const resp = await (await photoService.searchByUser({ targetId: video._id, limit: 99 })).data;
      this.setState({ photos: resp.data, fetching: false });
    } catch {
      this.setState({ fetching: false });
    }
  }

  loadMoreComment = async (videoId: string) => {
    const { moreComment: handleMoreComment } = this.props;
    const { itemPerPage, commentPage } = this.state;
    await this.setState({
      commentPage: commentPage + 1
    });
    handleMoreComment({
      limit: itemPerPage,
      objectType: 'video',
      offset: (commentPage + 1) * itemPerPage,
      objectId: videoId
    });
  };

  async deleteComment(item) {
    const { deleteComment: handleDeleteComment } = this.props;
    if (!window.confirm('Are you sure to remove this comment?')) return;
    handleDeleteComment(item._id);
  }

  async purchaseVideo() {
    const { video } = this.props;
    const { coupon, paymentGateway, curoMethod } = this.state;
    try {
      await this.setState({ submiting: true });
      const resp = await (await paymentService.purchaseVideo(video._id, {
        couponCode: coupon?.code || '',
        paymentGateway,
        method: curoMethod
      })).data;
      message.info('Redirecting to payment gateway, do not reload page at this time', 15);
      window.location.href = resp.paymentUrl;
    } catch (e) {
      const error = await e;
      this.setState({ submiting: false, openPurchaseModal: false });
      message.error(error.message || 'Error occured, please try again later');
    }
  }

  async applyCoupon() {
    try {
      const { couponCode } = this.state;
      await this.setState({ requesting: true });
      const resp = await paymentService.applyCoupon(couponCode);
      this.setState({ isApplyCoupon: true, coupon: resp.data, requesting: false });
      message.success('Coupon is applied');
    } catch (error) {
      const e = await error;
      message.error(e?.message || 'Error occured, please try again later');
      this.setState({ requesting: false });
    }
  }

  render() {
    const {
      error, user, ui, video, relatedVideos = {
        requesting: false,
        error: null,
        success: false,
        items: []
      },
      commentMapping,
      comment,
      curoEnabled,
      ccbillEnabled
    } = this.props;
    const { paymentGateway, curoMethod } = this.state;
    if (error) {
      return <Error statusCode={error?.statusCode || 404} title={error?.message || 'Video was not found'} />;
    }
    const { requesting: commenting } = comment;
    const fetchingComment = video && commentMapping.hasOwnProperty(video._id)
      ? commentMapping[video._id].requesting
      : false;
    const comments = video && commentMapping.hasOwnProperty(video._id)
      ? commentMapping[video._id].items
      : [];
    const totalComments = video && commentMapping.hasOwnProperty(video._id)
      ? commentMapping[video._id].total
      : 0;
    const { thumbnail, video: videoProp, teaser } = video;
    const thumbUrl = thumbnail?.url || (teaser?.thumbnails && teaser?.thumbnails[0]) || (videoProp?.thumbnails && videoProp?.thumbnails[0]) || '/no-image.jpg';
    const {
      videoStats, isLiked, isFavourited, isWatchedLater, openPurchaseModal, submiting,
      activeTab, membershipPlans, fetching, photos, requesting, isApplyCoupon, couponCode, coupon
    } = this.state;
    const videoJsOptions = {
      key: video?._id,
      autoplay: true,
      controls: true,
      playsinline: true,
      poster: thumbUrl,
      sources: [
        {
          src: video?.video?.url,
          type: 'video/mp4'
        }
      ]
    };
    const teaserOptions = {
      key: `teaser_${video?._id}`,
      autoplay: true,
      controls: true,
      playsinline: true,
      loop: true,
      poster: thumbUrl,
      sources: [
        {
          src: video?.teaser?.url,
          type: 'video/mp4'
        }
      ]
    };

    const lockUpcomingView = video.isSchedule && moment(video.scheduledAt).isAfter(new Date());

    return (
      <Layout>
        <Head>
          <title>
            {`${video?.title || ''}`}
          </title>
          <meta name="keywords" content={video?.description} />
          <meta name="description" content={video?.description} />
          {/* OG tags */}
          <meta
            property="og:title"
            content={`${ui.siteName} | ${video?.title || 'Video'}`}
            key="title"
          />
          <meta property="og:image" content={thumbUrl} />
          <meta property="og:keywords" content={video?.description} />
          <meta
            property="og:description"
            content={video?.description}
          />
          {/* Twitter tags */}
          <meta
            name="twitter:title"
            content={`${ui.siteName} | ${video?.title || 'Video'}`}
          />
          <meta name="twitter:image" content={thumbUrl} />
          <meta
            name="twitter:description"
            content={video?.description}
          />
        </Head>
        <div className="main-container">
          <h3 className="page-heading"><span className="box">{video?.title}</span></h3>
          <div className={style['page-sub-head']}>
            <span>
              <HourglassOutlined />
              {' '}
              {videoDuration(video?.video?.duration || 0)}
              &nbsp;&nbsp;
              <EyeOutlined />
              {' '}
              {shortenLargeNumber(videoStats?.views || 0)}
            </span>
            <span>
              <CalendarOutlined />
              {' '}
              {formatDate(video?.createdAt, 'LL')}
            </span>
          </div>
          <div className="vid-player">
            {!user?.hasFreeVideoAccess && (((video?.isSale && !video?.isBought) || (!video?.isSale && !user?.isSubscribed))) && (
              <div className={style['main-player']}>
                <div className="vid-group">
                  <div className="left-group">
                    {video?.teaser && video?.teaserProcessing && (
                      <div className="vid-processing">
                        <Spin />
                        <p>Teaser is currently on processing</p>
                      </div>
                    )}
                    {video?.teaser && !video?.teaserProcessing && <VideoPlayer {...teaserOptions} />}
                    {!video?.teaser && (<div className="video-thumbs" style={{ backgroundImage: `url(${thumbUrl})` }} />)}
                    {!video?.isSale && !user.isSubscribed ? (
                      <div className="vid-exl-group">
                        <h4>{!user._id ? 'SIGN UP TO ACCESS FULL VIDEO' : 'BE A MEMBER TO ACCESS THE FULL VIDEO'}</h4>
                        <h3>
                          CHECK THE MEMBERSHIP PLANS HERE
                          {' '}
                          <ArrowRightOutlined />
                        </h3>
                      </div>
                    ) : (
                      <div className="vid-exl-group">
                        <h4>{!user._id ? 'SIGN UP TO ACCESS FULL VIDEO' : 'UNLOCK TO VIEW FULL CONTENT'}</h4>
                        <h3>
                          PAY
                          {' '}
                          {ui.currencySymbol}
                          {coupon ? (video?.price - video?.price * coupon.value).toFixed(2) : (video?.price || 0).toFixed(2)}
                          {' '}
                          TO UNLOCK
                          {' '}
                          <ArrowRightOutlined />
                        </h3>
                      </div>
                    )}
                  </div>
                  {!video?.isSale && !user?.isSubscribed ? (
                    <div className="right-group">
                      <h3 className="title">MEMBERSHIP PLAN</h3>
                      <div className="member-plans">
                        {fetching && <div className="text-center"><Spin /></div>}
                        {!fetching && !membershipPlans.length && <div className="text-center">No membership plan was found</div>}
                        {!fetching && membershipPlans.length > 0 && membershipPlans.map((plan) => (
                          <SubscriptionPackage key={plan._id} user={user} item={plan} currencySymbol={ui.currencySymbol} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="right-group">
                      <h3 className="title">UNLOCK TO VIEW</h3>
                      <div className="member-plans custom">
                        <Radio.Group onChange={(e) => this.setState({ paymentGateway: e.target.value })} value={paymentGateway}>
                          {ccbillEnabled && (
                            <Radio value="ccbill">
                              <img alt="CCBill" src="/ccbill-ico.png" style={{ width: '50px', height: 'auto' }} />
                            </Radio>
                          )}
                          {curoEnabled && (
                            <Radio value="curo">
                              <img alt="CURO" src="/curo-icon.jpg" style={{ width: '50px', height: 'auto' }} />
                            </Radio>
                          )}
                        </Radio.Group>

                        {paymentGateway === 'curo' && (
                          <>
                            <hr />
                            <CuroMethodSelect
                              method={curoMethod}
                              onChange={(method) => this.setState({ curoMethod: method })}
                            />
                          </>
                        )}

                        <Input
                          style={{ margin: '5px 0' }}
                          placeholder="Enter a coupon code"
                          onChange={(e) => this.setState({ couponCode: e.target.value })}
                          disabled={isApplyCoupon}
                        />
                        <div className="checkout-price">
                          TOTAL:
                          {' '}
                          <span className={isApplyCoupon ? 'discount-p' : ''}>
                            {ui.currencySymbol}
                            {video?.price.toFixed(2)}
                          </span>
                          {' '}
                          {coupon && (
                            <span>
                              {ui.currencySymbol}
                              {(video?.price - coupon.value * video?.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <Space style={{ margin: '5px 0' }}>
                          {!isApplyCoupon ? (
                            <Button
                              disabled={!couponCode || requesting}
                              loading={requesting}
                              className="secondary"
                              onClick={() => this.applyCoupon()}
                            >
                              <strong>Apply coupon</strong>
                            </Button>
                          ) : (
                            <Button
                              className="secondary"
                              onClick={() => this.setState({ isApplyCoupon: false, coupon: null })}
                              disabled={requesting}
                            >
                              <strong>Use later</strong>
                            </Button>
                          )}
                          <Button
                            className="primary"
                            onClick={() => this.purchaseVideo()}
                            disabled={submiting || requesting || (!ccbillEnabled && !curoEnabled)}
                            loading={submiting}
                          >
                            <strong>CHECK OUT</strong>
                          </Button>
                        </Space>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {(user?.hasFreeVideoAccess || (!video.isSale && user?.isSubscribed) || (video.isSale && video.isBought)) && (
              <div className="vid-group custom">
                {lockUpcomingView && (
                  <>
                    {video?.teaser && !video.teaserProcessing && <VideoPlayer {...teaserOptions} />}
                    {!video?.teaser && (<div className="video-thumbs" style={{ backgroundImage: `url(${thumbUrl})` }} />)}
                  </>
                )}
                {!lockUpcomingView && (video?.processing ? (
                  <div className="vid-processing">
                    <Spin />
                    <p>Video file is currently on processing</p>
                  </div>
                ) : <VideoPlayer {...videoJsOptions} />)}
              </div>
            )}
            {video.isSchedule && video.scheduledAt && (
              <Alert
                type="error"
                message={(
                  <>
                    <NotificationOutlined />
                    {' '}
                    Main video will be premiered on
                    {' '}
                    {formatDate(video.scheduledAt, 'LL')}
                  </>
                )}
              />
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
                  {shortenLargeNumber(videoStats?.likes || 0)}
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
                  {shortenLargeNumber(videoStats?.favourites || 0)}
                  )
                </span>
              </Button>
              <Button
                className={isWatchedLater ? 'react-btn active' : 'react-btn'}
                onClick={() => this.onReaction('watch_later')}
              >
                <ClockCircleOutlined />
                <span>
                  Wishlist (
                  {shortenLargeNumber(videoStats?.wishlist || 0)}
                  )
                </span>
              </Button>
              <Button
                className={activeTab === 'comment' ? 'react-btn active' : 'react-btn'}
                onClick={() => this.onChangeTab('comment')}
              >
                <CommentOutlined />
                <span>
                  Comments (
                  {videoStats?.comments || 0}
                  )
                </span>
              </Button>
            </div>
            {video.categories && video.categories.length > 0 && (
              <div className="tags">
                Categories:
                &nbsp;
                {video.categories.map((cate) => (
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
            {video.tags && video.tags.length > 0 && (
              <div className="tags">
                Tags:
                {' '}
                {video.tags.map((tag) => (
                  <Link key={tag} href={{ pathname: '/search', query: { q: tag } }} as={`/search?q=${tag}`}>
                    <a className="tag-item">
                      #
                      {tag}
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="vid-information">
          <div className="main-container">
            <Tabs
              defaultActiveKey="description"
              activeKey={activeTab}
              onChange={this.onChangeTab.bind(this)}
              className="vid-tabs"
            >
              <TabPane tab="Description" key="description">
                <p style={{ whiteSpace: 'pre-line' }}>{video.description || 'No description'}</p>
              </TabPane>
              {/* <TabPane tab="Performers" key="participants">
                <List
                  itemLayout="horizontal"
                  dataSource={video?.performers || []}
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
              </TabPane>
              <TabPane tab="Photos" key="photo">
                {photos && photos.length > 0 && <PhotoPreviewList isBlur={!user || !user._id || !user.isSubscribed} photos={photos} />}
                {fetching && <div className="text-center"><Spin /></div>}
                {!fetching && !photos.length && <div className="text-center">No photo was found</div>}
              </TabPane> */}
              <TabPane
                tab="Comments"
                key="comment"
              >
                <CommentForm
                  creator={user}
                  onSubmit={this.onSubmitComment.bind(this)}
                  objectId={video._id}
                  requesting={commenting}
                  objectType="video"
                />

                <ListComments
                  key={`list_comments_${comments.length}`}
                  requesting={fetchingComment}
                  comments={comments}
                  // total={totalComments}
                  onDelete={this.deleteComment.bind(this)}
                  user={user}
                  canReply
                />

                {comments.length < totalComments && (
                  <p className="text-center">
                    <a aria-hidden onClick={this.loadMoreComment.bind(this)}>
                      More comments
                    </a>
                  </p>
                )}
              </TabPane>
            </Tabs>
          </div>
        </div>
        <div className="main-container">
          <div className="related-items">
            <h4 className="ttl-1">You may also like</h4>
            {relatedVideos.items.length > 0 && !relatedVideos.requesting && (
              <Row>
                {relatedVideos.items.map((v) => (
                  <Col xs={12} sm={12} md={6} lg={6} key={v._id}>
                    <VideoCard video={v} currencySymbol={ui.currencySymbol} />
                  </Col>
                ))}
              </Row>
            )}
            {!relatedVideos.items.length && !relatedVideos.requesting && (
              <p>No video was found</p>
            )}
            {relatedVideos.requesting && <div><Spin /></div>}
          </div>
        </div>
        <Modal
          key="purchase_post"
          title="Unlock video"
          visible={openPurchaseModal}
          footer={null}
          onCancel={() => this.setState({ openPurchaseModal: false })}
        >
          <PurchaseVideoForm video={video} submiting={submiting} onFinish={this.purchaseVideo.bind(this)} currencySymbol={ui.currencySymbol} />
        </Modal>
        {submiting && <Loader customText="Your payment is on processing, do not reload page until its done" />}
      </Layout>
    );
  }
}
const mapStates = (state: any) => {
  const { commentMapping, comment } = state.comment;
  return {
    relatedVideos: { ...state.video.relatedVideos },
    commentMapping,
    comment,
    user: { ...state.user.current },
    ui: { ...state.ui },
    ccbillEnabled: state.settings.ccbillEnable,
    curoEnabled: state.settings.curoEnabled
  };
};

const mapDispatch = {
  getRelated,
  getComments,
  moreComment,
  createComment,
  deleteComment
};
export default connect(mapStates, mapDispatch)(VideoViewPage);
