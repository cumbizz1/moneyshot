/* eslint-disable react/require-default-props */
/* eslint-disable no-nested-ternary */
import { getGlobalConfig } from '@services/config';
import { Layout, Switch } from 'antd';
import Link from 'next/link';
import React from 'react';

import ScrollBar from '../base/scroll-bar';
import { SiderMenu } from './menu';
import style from './sider.module.less';

interface ISiderProps {
  collapsed?: boolean;
  theme?: string;
  isMobile?: boolean;
  logo?: string;
  siteName?: string;
  onThemeChange?: Function
  menus?: any;
}

function Sider({
  collapsed, theme, isMobile, logo, siteName, onThemeChange, menus
}: ISiderProps) {
  return (
    <Layout.Sider
      width={256}
      breakpoint="lg"
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="slider"
    >
      <div className={style.brand}>
        <div className="logo">
          <Link href="/"><a>{logo ? <img alt="logo" src={logo} /> : siteName ? <h1>{siteName}</h1> : <h1>Admin Panel</h1>}</a></Link>
        </div>
      </div>

      <div className={style.menuContainer}>
        <ScrollBar
          options={{
            // Disabled horizontal scrolling, https://github.com/utatti/perfect-scrollbar#options
            suppressScrollX: true
          }}
        >
          <SiderMenu
            menus={menus}
            theme={theme}
            isMobile={isMobile}
          />
        </ScrollBar>
      </div>
      {!collapsed && (
        <div className={style.switchTheme}>
          <span>
            v
            {getGlobalConfig().NEXT_PUBLIC_BUILD_VERSION}
          </span>
          <Switch
            onChange={onThemeChange && onThemeChange.bind(
              this,
              theme === 'dark' ? 'light' : 'dark'
            )}
            defaultChecked={theme === 'dark'}
            checkedChildren="Dark"
            unCheckedChildren="Light"
          />
        </div>
      )}
    </Layout.Sider>
  );
}

export default Sider;
