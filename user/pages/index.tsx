import { ISettings } from '@interfaces/setting';
import { IUIConfig } from '@interfaces/ui-config';
import storeHolder from '@lib/storeHolder';
import { cookieService, postService } from '@services/index';
import {
  Button,
  Layout
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

interface IProps {
  ui: IUIConfig;
  settings: ISettings
  welcome: {
    content: string;
    title: string;
    image: any;
  };
}
class Dashboard extends PureComponent<IProps> {
  static authenticate = false;

  static layout = 'blank';

  public static async getInitialProps() {
    const store = storeHolder.getStore();
    const { settings } = store.getState() as any;
    if (!settings.welcomePageId) return {};

    try {
      const resp = await postService.findById(settings.welcomePageId);
      return {
        welcome: {
          content: resp.data?.content,
          title: resp.data?.title,
          image: resp.data?.image
        }
      };
    } catch {
      return {
        welcome: {
          content: '',
          title: '',
          image: null
        }
      };
    }
  }

  // componentDidMount() {
  //   const confirmAdult = cookieService.checkCookie('confirm_adult');
  //   confirmAdult && Router.replace('/home');
  // }

  confirm18 = () => {
    cookieService.setCookie('confirm_adult', 'true', 24);
    Router.replace('/home');
  };

  render() {
    const {
      ui, settings, welcome
    } = this.props;
    const pageTitle = `${ui.siteName} | Welcome`;
    return (
      <Layout>
        <Head>
          <title>{pageTitle}</title>
          <meta name="keywords" content={settings && settings.metaKeywords} />
          <meta
            name="description"
            content={settings && settings.metaDescription}
          />
          {/* OG tags */}
          <meta
            property="og:title"
            content={ui && ui.siteName}
          />
          <meta property="og:image" content={ui && ui.logoUrl} />
          <meta
            property="og:description"
            content={settings && settings.metaDescription}
          />
          {/* Twitter tags */}
          <meta
            name="twitter:title"
            content={ui && ui.siteName}
          />
          <meta name="twitter:image" content={ui && ui.logoUrl} />
          <meta
            name="twitter:description"
            content={settings && settings.metaDescription}
          />
        </Head>
        <div className="main-container">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'
          }}
          >
            <div className="term-welcome">
              <div className="left-group">
                {ui.logoUrl && <div className="site-logo"><img src={ui.logoUrl} alt="logo" /></div>}
                <h1 className="title">{welcome?.title}</h1>
                {/* eslint-disable-next-line react/no-danger */}
                <div className="content" dangerouslySetInnerHTML={{ __html: welcome?.content }} />
                <div className="btns-group">
                  <Button className="primary" style={{ borderRadius: 0 }} onClick={this.confirm18}>I am at least 18 years old</Button>
                  <Button className="secondary" style={{ borderRadius: 0 }} onClick={() => { window.location.href = 'https://google.com'; }}>Take me back</Button>
                </div>
              </div>
              <div className="right-group" style={{ backgroundImage: `url(${welcome?.image?.url || '/bg-home.jpeg'})` }}>
                <span>18+ Warning</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: state.ui,
  settings: state.settings
});

const mapDispatch = { };

export default connect(mapStatesToProps, mapDispatch)(Dashboard);
