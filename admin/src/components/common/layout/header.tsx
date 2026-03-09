/* eslint-disable react/require-default-props */
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import {
  Avatar, Dropdown,
  Layout, Menu
} from 'antd';
import Link from 'next/link';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';

import style from './header.module.less';

interface IProps {
  collapsed?: boolean;
  onCollapseChange?: Function;
  currentUser?: IUser;
}

function Header({
  collapsed, onCollapseChange, currentUser
}: IProps) {
  const rightContent = (
    <Dropdown overlay={(
      <Menu key="user" mode="horizontal">
        <Menu.Item key="settings">
          <Link href="/account/settings">
            <span>Update profile</span>
          </Link>
        </Menu.Item>
        <Menu.Item key="sign-out">
          <Link href="/auth/logout">
            <a>Log out</a>
          </Link>
        </Menu.Item>
      </Menu>
    )}
    >
      <Avatar style={{ margin: '0 15px' }} src={currentUser.avatar || '/no-avatar.png'} />
    </Dropdown>
  );

  return (
    <Layout.Header className={collapsed ? `${style.header} ${style.collapsed}` : style.header} id="layoutHeader">
      <div
        aria-hidden
        className="button"
        onClick={onCollapseChange.bind(this, !collapsed)}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>

      <div className="rightContainer">{rightContent}</div>
    </Layout.Header>
  );
}

const mapState = (state: any) => ({ currentUser: state.user.current });
export default connect(mapState)(Header);
