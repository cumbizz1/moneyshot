import {
  ContainerOutlined,
  DollarOutlined,
  FileImageOutlined,
  HeartOutlined,
  MenuOutlined,
  PictureOutlined,
  SettingOutlined,
  SkinOutlined,
  UnorderedListOutlined,
  UserOutlined,
  VideoCameraOutlined,
  WomanOutlined
} from '@ant-design/icons';
import Loader from '@components/common/base/loader';
import Header from '@components/common/layout/header';
import Sider from '@components/common/layout/sider';
import { BackTop, Drawer, Layout } from 'antd';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import { Router } from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces/ui-config';
import { loadUIValue, updateUIValue } from 'src/redux/ui/actions';

import style from './primary-layout.module.less';

interface DefaultProps extends IUIConfig {
  children: any;
  config: IUIConfig;
  updateUIValue: Function;
  loadUIValue: Function;
}

class PrimaryLayout extends PureComponent<DefaultProps> {
  state = {
    isMobile: false,
    routerChange: false
  };

  enquireHandler: any;

  componentDidMount() {
    const { loadUIValue: handleLoadUI } = this.props;
    handleLoadUI();
    this.enquireHandler = enquireScreen((mobile) => {
      const { isMobile } = this.state;
      if (isMobile !== mobile) {
        this.setState({
          isMobile: mobile
        });
      }
    });

    process.browser && this.handleStateChange();
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }

  handleStateChange() {
    Router.events.on('routeChangeStart', async () => this.setState({ routerChange: true }));
    Router.events.on('routeChangeComplete', async () => this.setState({ routerChange: false }));
  }

  onThemeChange = (theme: string) => {
    const { updateUIValue: updateUI } = this.props;
    updateUI({ theme });
  };

  onCollapseChange = (collapsed) => {
    const { updateUIValue: updateUI } = this.props;
    updateUI({ collapsed });
  };

  render() {
    const {
      children, collapsed, logo, siteName, theme
    } = this.props;
    const { isMobile, routerChange } = this.state;
    const headerProps = {
      collapsed,
      theme,
      onCollapseChange: this.onCollapseChange
    };

    const sliderMenus = [
      // {
      //   id: 'blockCountry',
      //   name: 'Blacklist Country',
      //   icon: <PieChartOutlined />,
      //   children: [
      //     {
      //       id: 'blockCountries',
      //       name: 'Listing',
      //       route: '/block-country'
      //     }
      //   ]
      // },
      {
        id: 'posts',
        name: 'Posts created',
        icon: <ContainerOutlined />,
        children: [
          {
            id: 'post-page',
            name: 'Posts',
            route: '/posts?type=page'
          },
          {
            id: 'page-create',
            name: 'New post',
            route: '/posts/create?type=page'
          }
        ]
      },
      {
        id: 'menu',
        name: 'Existing menu options',
        icon: <MenuOutlined />,
        children: [
          {
            id: 'menu-listing',
            name: 'Menu options',
            route: '/menu'
          },
          {
            name: 'New menu',
            id: 'create-menu',
            route: '/menu/create'
          }
        ]
      },
      {
        id: 'coupon',
        name: 'Coupons created',
        icon: <DollarOutlined />,
        children: [
          {
            id: 'coupon-listing',
            name: 'Coupons',
            route: '/coupon'
          },
          {
            name: 'New coupon',
            id: 'create-coupon',
            route: '/coupon/create'
          }
        ]
      },
      {
        id: 'banner',
        name: 'Banners added',
        icon: <FileImageOutlined />,
        children: [
          {
            id: 'banner-listing',
            name: 'Banners',
            route: '/banner'
          },
          {
            name: 'New banner',
            id: 'upload-banner',
            route: '/banner/upload'
          }
        ]
      },
      {
        id: 'accounts',
        name: 'User list',
        icon: <UserOutlined />,
        children: [
          {
            name: 'Users',
            id: 'users',
            route: '/users'
          },
          {
            name: 'New user',
            id: 'users-create',
            route: '/users/create'
          }
        ]
      },
      {
        id: 'categories',
        name: 'Current categories',
        icon: <UnorderedListOutlined />,
        children: [
          {
            id: 'categories-listing',
            name: 'Categories',
            route: '/categories'
          },
          {
            id: 'create-new',
            name: 'New category',
            route: '/categories/create'
          }
        ]
      },
      {
        id: 'performers',
        name: 'Current models',
        icon: <WomanOutlined />,
        children: [
          {
            name: 'Models',
            id: 'listing',
            route: '/performer'
          },
          {
            name: 'New model',
            id: 'create-performers',
            route: '/performer/create'
          }
        ]
      },
      {
        id: 'free-video-access',
        name: 'Free Access Video',
        icon: <VideoCameraOutlined />,
        children: [
          {
            id: 'free-video-access-listing',
            name: 'Users free access video',
            route: '/free-access-video'
          },
          {
            id: 'free-video-access-create',
            name: 'New user free access video',
            route: '/free-access-video/create'
          }
        ]
      },
      {
        id: 'videos',
        name: 'Existing videos',
        icon: <VideoCameraOutlined />,
        children: [
          {
            id: 'video-listing',
            name: 'Videos',
            route: '/video'
          },
          {
            id: 'video-upload',
            name: 'Upload new',
            route: '/video/upload'
          },
          {
            id: 'video-bulk-upload',
            name: 'Bulk upload',
            route: '/video/bulk-upload'
          }
        ]
      },
      {
        id: 'gallery',
        name: 'Existing galleries',
        icon: <PictureOutlined />,
        children: [
          {
            id: 'gallery-listing',
            name: 'Galleries',
            route: '/gallery'
          },
          {
            id: 'gallery-new',
            name: 'New gallery',
            route: '/gallery/create'
          },
          // {
          //   id: 'photo-listing',
          //   name: 'Photo Listing',
          //   route: '/photos'
          // },
          {
            name: 'Upload photo',
            id: 'upload-photo',
            route: '/photos/upload'
          },
          {
            name: 'Bulk upload',
            id: 'bulk-upload-photo',
            route: '/photos/bulk-upload'
          }
        ]
      },
      {
        id: 'performers-products',
        name: 'Inventory',
        icon: <SkinOutlined />,
        children: [
          {
            id: 'product-listing',
            name: 'Products',
            route: '/product'
          },
          {
            name: 'New product',
            id: 'create-product',
            route: '/product/create'
          }
        ]
      },
      {
        id: 'payments',
        name: 'Payment History',
        icon: <ContainerOutlined />,
        children: [
          {
            id: 'payment-listing',
            name: 'Payment History',
            route: '/payment-history'
          }
        ]
      },
      {
        id: 'order',
        name: 'Orders History',
        icon: <ContainerOutlined />,
        children: [
          {
            id: 'order-listing',
            name: 'Orders History',
            route: '/order'
          }
        ]
      },
      {
        id: 'subscription-package',
        name: 'Current packages',
        icon: <HeartOutlined />,
        children: [
          {
            id: 'package-list',
            name: 'Subscription Packages',
            route: '/subscription-package'
          },
          {
            name: 'New package',
            id: 'create-subscription-package',
            route: '/subscription-package/create'
          }
        ]
      },
      {
        id: 'subscriptions',
        name: 'Admin-created subscriptions',
        icon: <HeartOutlined />,
        children: [
          {
            name: 'Subscriptions created',
            id: 'subscription-list',
            route: '/subscription'
          },
          {
            name: 'New subscription',
            id: 'create-subscription',
            route: '/subscription/create'
          }
        ]
      },
      {
        id: 'settings',
        name: 'Settings',
        icon: <SettingOutlined />,
        children: [
          {
            id: 'system-settings',
            route: '/settings',
            as: '/settings',
            name: 'Settings'
          }
        ]
      }
    ];
    const siderProps = {
      collapsed,
      isMobile,
      logo,
      siteName,
      theme,
      menus: sliderMenus,
      onCollapseChange: this.onCollapseChange,
      onThemeChange: this.onThemeChange
    };

    return (
      <Layout>
        {isMobile ? (
          <Drawer
            maskClosable
            closable={false}
            onClose={this.onCollapseChange.bind(this, !collapsed)}
            visible={!collapsed}
            placement="left"
            width={257}
            style={{
              padding: 0,
              height: '100vh'
            }}
          >
            <Sider {...siderProps} />
          </Drawer>
        ) : (
          <Sider {...siderProps} />
        )}
        <div className={style.container} id="primaryLayout">
          <Header {...headerProps} />
          <Layout.Content className={style.content} style={{ position: 'relative' }}>
            {routerChange && <Loader spinning />}
            {children}
          </Layout.Content>
          <BackTop className="backTop" target={() => document.querySelector('#primaryLayout') as any} />
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ...state.ui
});
const mapDispatchToProps = { updateUIValue, loadUIValue };

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryLayout);
