import {
  login, loginSuccess
} from '@redux/auth/actions';
import { updateCurrentUser } from '@redux/user/actions';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Layout,
  Row
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';

import style from './index.module.less';

interface IProps {
  loginAuth: any;
  login: Function;
  ui: IUIConfig
}

class Login extends PureComponent<IProps> {
  static authenticate = false;

  static layout = 'auth';

  state = {
    inputPassword: ''
  };

  async handleLogin(values: any) {
    const { login: handleLogin } = this.props;
    return handleLogin(values);
  }

  render() {
    const { ui, loginAuth: { requesting } } = this.props;
    const { inputPassword } = this.state;
    return (
      <Layout>
        <Head>
          <title>Login</title>
        </Head>
        <div className={style['login-page']} style={{ backgroundImage: `url(${ui?.loginPlaceholderImage || '/bg-login.jpeg'})` }}>
          <div className={style['login-box']}>
            {ui.logoUrl && <div className={style['login-logo']}><a href="/home"><img alt="logo" src={ui.logoUrl} /></a></div>}
            <div className="login-form">
              <h2 className="title">
                LOGIN
              </h2>
              <div className={style['form-message']}>
                <Form
                  name="normal_login"
                  initialValues={{ remember: true }}
                  onFinish={this.handleLogin.bind(this)}
                >
                  <Form.Item
                    name="username"
                    // hasFeedback={inputLogin.length >= 3}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      { required: true, message: 'Email address or Username is missing' },
                      { min: 3, message: 'Username must containt at least 3 characters' }
                    ]}
                  >
                    <Input placeholder="Email/Username" />
                  </Form.Item>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name="password"
                    validateTrigger={['onChange', 'onBlur']}
                    hasFeedback={inputPassword.length >= 8}
                    rules={[
                      { required: true, message: 'Please enter your password!' },
                      { min: 8, message: 'Password must containt at least 8 characters' }
                    ]}
                  >
                    <Input.Password onChange={(e) => this.setState({ inputPassword: e.target.value })} placeholder="Password" />
                  </Form.Item>
                  <Form.Item>
                    <Row>
                      <Col span={12}>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                          <Checkbox style={{ color: 'white' }}>Remember me</Checkbox>
                        </Form.Item>
                      </Col>
                      <Col span={12} style={{ textAlign: 'right' }}>
                        <Link
                          href={{
                            pathname: '/auth/forgot-password',
                            query: { type: 'user' }
                          }}
                        >
                          <a>Forgot password?</a>
                        </Link>
                      </Col>
                    </Row>
                  </Form.Item>
                  <Form.Item style={{ textAlign: 'center' }}>
                    <Button
                      loading={requesting}
                      disabled={requesting}
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                    >
                      LOGIN
                    </Button>
                    <p className="white-color">
                      Don&apos;t have an account yet ?
                      <Link
                        href="/auth/register"
                      >
                        <a> Create an account</a>
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
        </div>
      </Layout>
    );
  }
}

const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  loginAuth: { ...state.auth.loginAuth }
});

const mapDispatchToProps = {
  login, loginSuccess, updateCurrentUser
};
export default connect(mapStatesToProps, mapDispatchToProps)(Login) as any;
