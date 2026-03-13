import { HomeOutlined, LoginOutlined } from '@ant-design/icons';
import { Button, Layout, Result } from 'antd';
import Head from 'next/head';
import Router from 'next/router';

export function EmailVerified() {
  return (
    <Layout>
      <Head>
        <title>Email verified</title>
      </Head>
      <div className="main-container">
        <Result
          status="success"
          title="Email address verified"
          subTitle="Hi there, your email address has been verified"
          extra={[
            <Button className="secondary" key="console" onClick={() => Router.push('/home')}>
              <HomeOutlined />
              HOME
            </Button>,
            <Button key="buy" className="primary" onClick={() => Router.push('/auth/login')}>
              <LoginOutlined />
              LOG IN
            </Button>
          ]}
        />
      </div>
    </Layout>
  );
}

export default EmailVerified;
