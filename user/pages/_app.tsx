import '../style/index.less';

import BaseLayout from '@layouts/base-layout';
import { loginSuccess } from '@redux/auth/actions';
import { updateSettings } from '@redux/settings/actions';
import { wrapper } from '@redux/store';
import { updateUIValue } from '@redux/ui/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { setGlobalConfig } from '@services/config';
import {
  authService, settingService,
  userService
} from '@services/index';
import { NextPageContext } from 'next';
import App from 'next/app';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import React from 'react';
import { END } from 'redux-saga';
import { Socket } from 'src/socket';

const publicConfig = {} as any;

function redirectLogin(ctx: any) {
  if (typeof window !== 'undefined') {
    authService.removeToken();
    Router.push('/auth/login');
    return;
  }

  // fix for production build
  ctx.res.clearCookie && ctx.res.clearCookie('token');
  ctx.res.clearCookie && ctx.res.clearCookie('role');
  ctx.res.writeHead && ctx.res.writeHead(302, { Location: '/auth/login' });
  ctx.res.end && ctx.res.end();
}

async function auth(
  ctx: NextPageContext,
  store,
  noredirect: boolean
) {
  try {
    const state = store.getState();
    if (state.auth && state.auth.loggedIn) {
      return;
    }
    // TODO - move to a service
    const { token } = nextCookie(ctx);
    if (token) {
      authService.setToken(token);
      const user = await userService.me({
        Authorization: token
      });
      // TODO - check permission
      store.dispatch(loginSuccess());
      store.dispatch(updateCurrentUser(user.data));
      return;
    }

    !noredirect && redirectLogin(ctx);
  } catch (e) {
    redirectLogin(ctx);
  }
}

async function loadUser(token, store) {
  try {
    authService.setToken(token);
    const user = await userService.me({
      Authorization: token
    });
    // TODO - check permission
    store.dispatch(loginSuccess());
    store.dispatch(updateCurrentUser(user.data));
  // eslint-disable-next-line no-empty
  } catch {}
}

async function updateSettingsStore(store, settings) {
  store.dispatch(
    updateUIValue({
      logoUrl: settings.logoUrl,
      siteName: settings.siteName,
      favicon: settings.favicon,
      loginPlaceholderImage: settings.loginPlaceholderImage,
      menus: settings.menus,
      footerContent: settings.footerContent,
      currency: settings.currency || 'USD',
      currencySymbol: settings.currencySymbol || '$'
    })
  );

  store.dispatch(updateSettings(settings));
}

interface AppComponent extends NextPageContext {
  layout: string;
}

interface IApp {
  config: any;
  Component: AppComponent;
  maintenance: boolean;
}

class Application extends App<IApp> {
  public static getInitialProps = wrapper.getInitialAppProps((store) => async (context) => {
    const { Component, ctx } = context;
    // do not load env in client side
    // overwrite config cause we need minified version, remove if we don't need
    let maintenance = false;
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

    // NOTE - do not move this line to condition above, will theor error
    if (typeof window === 'undefined') {
      // server side to load settings, once time only
      const settings = await settingService.all('all', true);
      await updateSettingsStore(store, settings.data);
      maintenance = settings.data.maintenanceMode;
    }

    // won't check auth for un-authenticated page such as login, register
    // use static field in the component
    const { noredirect, authenticate } = Component as any;
    const { token } = nextCookie(ctx);
    (context as any).token = token || '';
    if (authenticate) await auth(ctx, store, noredirect);
    else if (token) {
      // load user if needed
      await loadUser(token, store);
    }

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
      pageProps,
      config: publicConfig,
      maintenance
    };
  });

  constructor(props) {
    super(props);
    setGlobalConfig(this.props.config);
  }

  render() {
    const {
      Component, pageProps, maintenance
    } = this.props;

    const { layout } = Component;
    return (
      <Socket>
        <BaseLayout layout={layout} maintenance={maintenance}>
          <Component {...pageProps} />
        </BaseLayout>
      </Socket>
    );
  }
}

export default wrapper.withRedux(Application);
