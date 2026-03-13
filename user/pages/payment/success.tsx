import { HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { clearCart } from '@redux/cart/actions';
import { updateCurrentUser } from '@redux/user/actions';
import { authService } from '@services/auth.service';
import { userService } from '@services/user.service';
import { Button, Layout, Result } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUser } from 'src/interfaces';

interface IProps {
  user: IUser;
  clearCart: Function;
  updateCurrentUser: Function;
}

class PaymentSuccess extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  componentDidMount() {
    const { clearCart: clearCartHandler } = this.props;
    this.updateCurrentUser();
    setTimeout(() => { clearCartHandler(); }, 1000);
    localStorage.setItem('cart', JSON.stringify([]));
  }

  async updateCurrentUser() {
    const { updateCurrentUser: handleUpdateUser } = this.props;
    const token = authService.getToken();
    if (token) {
      const user = await userService.me({
        Authorization: token
      });
      if (!user.data._id) {
        return;
      }
      handleUpdateUser(user.data);
    }
  }

  render() {
    const { user } = this.props;
    return (
      <Layout>
        <Head>
          <title>Payment success</title>
        </Head>
        <div className="main-container">
          <Result
            status="success"
            title="Payment Success"
            subTitle={`Hi ${user?.name || user?.username || `${user?.firstName} ${user?.lastName}` || 'there'}, your payment has been successful`}
            extra={[
              <Button className="secondary" key="console" onClick={() => Router.push('/home')}>
                <HomeOutlined />
                BACK HOME
              </Button>,
              <Button key="buy" className="primary" onClick={() => Router.push('/store')}>
                <ShoppingCartOutlined />
                GO SHOPPING AGAIN
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

const mapDispatch = { clearCart, updateCurrentUser };
export default connect(mapStates, mapDispatch)(PaymentSuccess);
