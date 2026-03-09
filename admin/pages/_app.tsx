import '../style/index.less';

import BaseLayout from '@layouts/base-layout';
import { loginSuccess } from '@redux/auth/actions';
import { wrapper } from '@redux/store';
import { updateUIValue } from '@redux/ui/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { setGlobalConfig } from '@services/config';
import { authService, userService } from '@services/index';
import { settingService } from '@services/setting.service';
import { NextPageContext } from 'next';
import App from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import React from 'react';
import { Store } from 'redux';
import { END } from 'redux-saga';

function redirectLogin(ctx: any) {
  if (typeof window !== 'undefined') {
    authService.removeToken();
    Router.push('/auth/login');
    return;
  }

  // fix for production build
  ctx.res.clearCookie && ctx.res.clearCookie('token');
  ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/auth/login' });
  ctx.res.end && ctx.res.end();
}

async function auth(ctx: NextPageContext, store: Store) {
  try {
    const state = store.getState();
    if (state.auth && state.auth.loggedIn) {
      return;
    }
    // TODO - move to a service
    const { token } = nextCookie(ctx);
    if (!token) {
      // log out and redirect to login page
      // TODO - reset app state?
      redirectLogin(ctx);
      return;
    }
    authService.setAuthHeaderToken(token);
    const user = await userService.me({
      Authorization: token
    });
    // TODO - check permission
    if (user.data && !user.data.roles.includes('admin')) {
      redirectLogin(ctx);
      return;
    }
    store.dispatch(loginSuccess());
    store.dispatch(updateCurrentUser(user.data));
  } catch (e) {
    redirectLogin(ctx);
  }
}

async function updateSettingsStore(store: Store, settings: any) {
  store.dispatch(
    updateUIValue({
      logo: settings.logoUrl,
      siteName: settings.siteName,
      currencySymbol: settings.currencySymbol
    })
  );
}

interface AppComponent extends NextPageContext {
  layout: string;
}

interface IApp {
  store: Store;
  layout: string;
  authenticate: boolean;
  Component: AppComponent;
  settings: any;
  config: any;
}

const publicConfig = {} as any;

class Application extends App<IApp> {
  public static getInitialProps = wrapper.getInitialAppProps((store) => async (context) => {
    const { Component, ctx } = context;
    // load configuration from ENV and put to config
    if (typeof window === 'undefined') {
      // eslint-disable-next-line global-require
      const dotenv = require('dotenv');
      const myEnv = dotenv.config().parsed;

      // publish to server config with app
      setGlobalConfig(myEnv);

      // load public config and api-endpoint?
      Object.keys(myEnv).forEach((key) => {
        if (key.indexOf('NEXT_PUBLIC_') === 0) {
          publicConfig[key] = myEnv[key];
        }
      });
    }

    const { authenticate } = Component as any;
    authenticate !== false && (await auth(ctx, store));
    const { token } = nextCookie(ctx);
    (ctx as any).token = token || '';
    // server side to load settings, once time only
    let settings = {};
    const setting = await settingService.public('all');
    settings = { ...setting.data };
    await updateSettingsStore(store, settings);
    // Wait for all page actions to dispatch
    const pageProps = {
      // https://nextjs.org/docs/advanced-features/custom-app#caveats
      ...(await App.getInitialProps(context)).pageProps
    };
    // Stop the saga if on server
    if (typeof window === 'undefined') {
      store.dispatch(END);
      await (store as any).sagaTask.toPromise();
    }
    // Return props
    return {
      settings,
      pageProps,
      layout: (Component as any).layout,
      config: publicConfig
    };
  });

  constructor(props: any) {
    super(props);
    setGlobalConfig(this.props.config);
  }

  render() {
    const {
      Component, pageProps, settings
    } = this.props;
    const { layout } = Component;
    return (
      <BaseLayout layout={layout}>
        <Head>
          <link rel="icon" href={settings?.favicon} sizes="64x64" />
        </Head>
        <Component {...pageProps} />
      </BaseLayout>
    );
  }
}

export default wrapper.withRedux(Application);
