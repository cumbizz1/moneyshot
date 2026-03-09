import './index.module.less';

import Page from '@components/common/layout/page';
import { logout } from '@redux/auth/actions';
import Head from 'next/head';
import { useEffect } from 'react';
import { connect } from 'react-redux';

interface IProps {
  handleLogout: Function;
}

function Logout({
  handleLogout
}: IProps) {
  useEffect(() => {
    handleLogout();
  }, []);
  return (
    <>
      <Head>
        <title>Log out</title>
      </Head>
      <Page>
        <span>Logout...</span>
      </Page>
    </>
  );
}

export default connect(null, { handleLogout: logout })(Logout);
