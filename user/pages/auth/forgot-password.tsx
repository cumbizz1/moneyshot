/* eslint-disable react/no-did-update-set-state */

import { authService } from '@services/index';
import {
  Button, Form, Input, Layout, message
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IForgot, IUIConfig } from 'src/interfaces';

import style from './index.module.less';

interface IProps {
  ui: IUIConfig;
}

interface IState {
  submiting: boolean;
  countTime: number;
}

class Forgot extends PureComponent<IProps, IState> {
  static authenticate = false;

  static layout = 'auth';

  _intervalCountdown: any;

  state = {
    submiting: false,
    countTime: 60
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.countTime === 0) {
      this._intervalCountdown && clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
    }
  }

  componentWillUnmount() {
    this._intervalCountdown && clearInterval(this._intervalCountdown);
  }

  handleReset = async (data: IForgot) => {
    await this.setState({ submiting: true });
    try {
      await authService.resetPassword({
        ...data,
        type: 'user'
      });
      message.success('An email has been sent to you to reset your password');
      this.handleCountdown();
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  };

  handleCountdown = async () => {
    const { countTime } = this.state;
    if (countTime === 0) {
      clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
      return;
    }
    this.setState({ countTime: countTime - 1 });
    this._intervalCountdown = setInterval(this.coundown.bind(this), 1000);
  };

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  render() {
    const { ui } = this.props;
    const { submiting, countTime } = this.state;
    const { siteName } = ui;
    const pageTitle = `${siteName} } | Reset Password`;
    return (
      <Layout>
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <div className={style['login-page']} style={{ backgroundImage: `url(${ui?.loginPlaceholderImage || '/bg-login.jpeg'})` }}>
          <div className={style['login-box']}>
            {ui.logoUrl && <div className={style['login-logo']}><a href="/home"><img alt="logo" src={ui.logoUrl} /></a></div>}
            <div className="login-form">
              <h2 className="title">RESET PASSWORD</h2>
              <Form className={style['form-message']} name="login-form" onFinish={this.handleReset.bind(this)}>
                <Form.Item
                  hasFeedback
                  name="email"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      type: 'email',
                      message: 'Invalid email format'
                    },
                    {
                      required: true,
                      message: 'Please enter your email address!'
                    }
                  ]}
                >
                  <Input placeholder="Enter your email address" />
                </Form.Item>
                <Form.Item style={{ textAlign: 'center' }}>
                  <Button
                    className="primary"
                    type="primary"
                    htmlType="submit"
                    style={{
                      width: '100%',
                      marginBottom: 15,
                      fontWeight: 600,
                      padding: '5px 25px',
                      height: '42px'
                    }}
                    disabled={submiting || countTime < 60}
                    loading={submiting || countTime < 60}
                  >
                    {countTime < 60 ? 'Resend in' : 'Send'}
                    {' '}
                    {countTime < 60 && `${countTime}s`}
                  </Button>
                  <p className="white-color">
                    Have an account already?
                    <Link href="/auth/login">
                      <a> Login here.</a>
                    </Link>
                  </p>
                  <p className="white-color">
                    Don&apos;t have an account yet
                    <Link href="/auth/register">
                      <a> Create an account.</a>
                    </Link>
                  </p>
                  <p className="white-color">
                    Resend email verification?
                    <Link
                      href="/auth/resend-email-verification"
                    >
                      <a> Click here</a>
                    </Link>
                  </p>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStatetoProps = (state: any) => ({
  ui: { ...state.ui }
});

export default connect(mapStatetoProps)(Forgot);
