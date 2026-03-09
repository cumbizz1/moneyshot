import {
  ClockCircleOutlined, CrownOutlined, HeartOutlined,
  HistoryOutlined, HomeOutlined,
  LoginOutlined,
  LogoutOutlined, SearchOutlined, ShopOutlined, ShoppingCartOutlined, StarOutlined, UserOutlined, VideoCameraOutlined
} from '@ant-design/icons';
import { formatDate } from '@lib/date';
import { logout } from '@redux/auth/actions';
import {
  Avatar, Badge, Divider,
  Drawer, Layout
} from 'antd';
import Link from 'next/link';
import { Router as RouterEvent, withRouter } from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';
import { addCart } from 'src/redux/cart/actions';
import { authService, cartService } from 'src/services';
import { SocketContext } from 'src/socket';

import headerCss from './header.module.less';
import SearchBar from './search-bar';

interface IProps {
  // eslint-disable-next-line react/require-default-props
  currentUser?: IUser;
  // eslint-disable-next-line react/require-default-props
  logout?: Function;
  router: any;
  // eslint-disable-next-line react/require-default-props
  ui?: any;
  // eslint-disable-next-line react/require-default-props
  cart?: any;
  addCart: Function;
}

class Header extends PureComponent<IProps> {
  state = {
    openSearch: false,
    openProfile: false
  };

  componentDidMount() {
    if (typeof window !== 'undefined') {
      const { addCart: addCartHandler } = this.props;
      RouterEvent.events.on('routeChangeStart', this.handleChangeRoute);
      const existCart = cartService.getCartItems();
      if (existCart && existCart.length > 0) {
        addCartHandler(existCart);
      }
    }
  }

  componentWillUnmount() {
    RouterEvent.events.off('routeChangeStart', this.handleChangeRoute);
    const token = authService.getToken();
    const socket = this.context as any;
    token && socket && socket.emit('auth/logout', { token });
  }

  handleChangeRoute = () => {
    this.setState({
      openProfile: false, openSearch: false
    });
  };

  async beforeLogout() {
    const { logout: logoutHandler } = this.props;
    const token = authService.getToken();
    const socket = this.context as any;
    token && socket && (await socket.emit('auth/logout', { token }));
    socket && socket.close();
    logoutHandler();
  }

  render() {
    const {
      currentUser, router, ui, cart
    } = this.props;
    const { openSearch, openProfile } = this.state;
    return (
      <div className={headerCss['main-header']}>
        <div className="main-container">
          <div className="nav-logo">
            <Link href="/home">
              <a>
                {ui?.logoUrl ? (
                  <img
                    alt="logo"
                    src={ui?.logoUrl}
                    height="64"
                  />
                ) : <span>{ui?.siteName}</span>}
              </a>
            </Link>
          </div>
          <Layout.Header className="header" id="layoutHeader">
            <div className="nav-bar">
              <ul className="nav-icons">
                <Link href="/home">
                  <li className={router.pathname === '/home' ? 'active' : ''}>
                    <a>
                      <HomeOutlined />
                      <span className="hide">Home</span>
                    </a>
                  </li>
                </Link>
                <Link href="/model">
                  <li className={router.pathname === '/model' ? 'active' : ''}>
                    <a>
                      <StarOutlined />
                      <span className="hide">Models</span>
                    </a>
                  </li>
                </Link>
                <Link href="/video">
                  <li className={router.pathname === '/video' ? 'active' : ''}>
                    <a>
                      <VideoCameraOutlined />
                      <span className="hide">Videos</span>
                    </a>
                  </li>
                </Link>
                {/* <Link href="/gallery">
                  <li className={router.pathname === '/gallery' ? 'active' : ''}>
                    <a>
                      <PictureOutlined />
                      <span className="hide">Categories</span>
                    </a>
                  </li>
                </Link> */}
                <Link href="/store">
                  <li className={router.pathname === '/store' ? 'active' : ''}>
                    <a>
                      <ShopOutlined />
                      <span className="hide">Store</span>
                    </a>
                  </li>
                </Link>
                <Link href="/cart">
                  <li className={router.pathname === '/cart' ? 'active' : ''}>
                    <a>
                      <ShoppingCartOutlined />
                      <Badge
                        className="cart-total"
                        count={cart.total}
                        showZero
                      />
                    </a>
                  </li>
                </Link>
                <li key="search" className={openSearch ? 'active' : ''} aria-hidden onClick={() => this.setState({ openSearch: !openSearch })}>
                  <a className="search-mobile"><SearchOutlined /></a>
                </li>
                {currentUser._id ? (
                  <li aria-hidden onClick={() => this.setState({ openProfile: true })}>
                    <Avatar src={currentUser.avatar || '/no-avatar.png'} />
                  </li>
                ) : (
                  <Link href="/auth/login">
                    <li className="custom" key="login">
                      <a>
                        <LoginOutlined />
                        <span className="hide">LOGIN</span>
                      </a>
                    </li>
                  </Link>
                )}
              </ul>
              <Drawer
                title="Search"
                closable
                onClose={() => this.setState({ openSearch: false })}
                visible={openSearch}
                key="search-drawer"
                className={headerCss['profile-drawer']}
                width={280}
              >
                <SearchBar />
              </Drawer>
              <Drawer
                title={(
                  <div className="profile-user">
                    <img src={currentUser.avatar || '/no-avatar.png'} alt="logo" />
                    <a className="profile-name">
                      {currentUser.name || 'N/A'}
                      <span>
                        @
                        {currentUser.username || 'n/a'}
                      </span>
                    </a>
                  </div>
                )}
                // closable
                onClose={() => this.setState({ openProfile: false })}
                visible={openProfile}
                key="profile-drawer"
                className={headerCss['profile-drawer']}
                width={280}
              >
                <div className="profile-menu-item">
                  <Link href="/user/account" as="/user/account">
                    <div className={router.pathname === '/user/account' ? 'menu-item active' : 'menu-item'}>
                      <UserOutlined />
                      {' '}
                      Edit Profile
                    </div>
                  </Link>
                  <Divider />
                  <Link href="/user/my-favourite" as="/user/my-favourite">
                    <div className={router.pathname === '/user/my-favourite' ? 'menu-item active' : 'menu-item'}>
                      <HeartOutlined />
                      {' '}
                      My Favourite
                    </div>
                  </Link>
                  <Link href="/user/my-wishlist" as="/user/my-wishlist">
                    <div className={router.pathname === '/user/my-wishlist' ? 'menu-item active' : 'menu-item'}>
                      <ClockCircleOutlined />
                      {' '}
                      My Wishlist
                    </div>
                  </Link>
                  <Divider />
                  <Link href="/user/orders" as="/user/orders">
                    <div className={router.pathname === '/user/orders' ? 'menu-item active' : 'menu-item'}>
                      <ShoppingCartOutlined />
                      {' '}
                      Order History
                    </div>
                  </Link>
                  <Link href="/user/payment-history" as="/user/payment-history">
                    <div className={router.pathname === '/user/payment-history' ? 'menu-item active' : 'menu-item'}>
                      <HistoryOutlined />
                      {' '}
                      Payment History
                    </div>
                  </Link>
                  <Divider />
                  <div className="menu-item" aria-hidden onClick={() => this.beforeLogout()}>
                    <LogoutOutlined />
                    {' '}
                    Sign Out
                  </div>
                </div>
                {currentUser._id && (
                  <div className="membership">
                    <CrownOutlined />
                    {' '}
                    {currentUser.isSubscribed ? (
                      <span>
                        The Membership plan will be expired on
                        {' '}
                        {formatDate(currentUser.memberShipExpiredAt, 'LLL')}
                      </span>
                    )
                      : <Link href="/user/upgrade-membership"><a>Become a member</a></Link>}
                  </div>
                )}
              </Drawer>
            </div>
          </Layout.Header>
        </div>
      </div>
    );
  }
}

Header.contextType = SocketContext;
const mapState = (state: any) => ({
  currentUser: { ...state.user.current },
  ui: { ...state.ui },
  cart: { ...state.cart }
});
const mapDispatch = { logout, addCart };
export default withRouter(connect(mapState, mapDispatch)(Header)) as any;
