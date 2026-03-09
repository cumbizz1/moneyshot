import { HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Layout, Result } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';

interface IProps {
  user: IUser;
}

class PaymentCancel extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  render() {
    const { user } = this.props;
    return (
      <Layout>
        <Head>
          <title>Payment fail</title>
        </Head>
        <div className="main-container">
          <Result
            status="error"
            title="Payment Fail"
            subTitle={`Hi ${user?.name || user?.username || `${user?.firstName} ${user?.lastName}` || 'there'}, your payment has been fail. Please contact us for more information.`}
            extra={[
              <Button className="secondary" key="console" onClick={() => Router.push('/home')}>
                <HomeOutlined />
                BACK HOME
              </Button>,
              <Button key="buy" className="primary" onClick={() => Router.push('/contact')}>
                <ShoppingCartOutlined />
                CONTACT US
              </Button>
            ]}
          />
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  user: state.user.current
});

export default connect(mapStates)(PaymentCancel);
