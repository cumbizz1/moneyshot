import { getResponseError } from '@lib/utils';
import { login } from '@redux/auth/actions';
import { getGlobalConfig } from '@services/config';
import {
  Alert, Button, Form, Input, Layout,
  Row
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

import style from './index.module.less';

const FormItem = Form.Item;

interface IProps {
  loginAuth: any;
  ui: any;
  login: Function;
}

class Login extends PureComponent<IProps> {
  static layout: string = 'public';

  static authenticate: boolean = false;

  handleOk = (data: any) => {
    const { login: handlerLogin } = this.props;
    handlerLogin(data);
  };

  render() {
    const { ui } = this.props;
    const {
      loginAuth = { requesting: false, error: null, success: false }
    } = this.props;
    const config = getGlobalConfig();
    return (
      <Layout>
        <Head>
          <title>Login</title>
        </Head>
        <div className={style.form}>
          <div className={style.logo}>{ui?.logo && <img alt="logo" src={ui?.logo} />}</div>
          <div className={style.sitename}>
            <span>
              Admin panel
            </span>
          </div>
          {loginAuth.error && (
            <Alert
              message={null}
              description={getResponseError(loginAuth.error)}
              type="error"
            />
          )}
          {loginAuth.success ? (
            <Alert
              message="Login success"
              type="success"
              description="Redirecting..."
            />
          ) : (
            <Form
              onFinish={this.handleOk}
              initialValues={{
                email: '',
                password: ''
              }}
            >
              <FormItem
                hasFeedback
                name="username"
                rules={[
                  { required: true, message: 'Please input email address or username' }
                ]}
              >
                <Input
                  onPressEnter={this.handleOk}
                  placeholder="Email or Username"
                />
              </FormItem>
              <FormItem
                hasFeedback
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' }
                ]}
              >
                <Input
                  type="password"
                  onPressEnter={this.handleOk}
                  placeholder="Password"
                />
              </FormItem>
              <Row>
                <Button
                  type="primary"
                  onClick={this.handleOk}
                  loading={loginAuth.requesting}
                  disabled={loginAuth.requesting}
                  htmlType="submit"
                >
                  Sign in
                </Button>
              </Row>
            </Form>
          )}

          <p>
            <Link href="/auth/forgot">
              <a>Forgot password?</a>
            </Link>
          </p>
        </div>
        <div className={style.footer}>
          Version
          {' '}
          {config.NEXT_PUBLIC_BUILD_VERSION}
          {' '}
          - Copy right
          {' '}
          {new Date().getFullYear()}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  loginAuth: state.auth.login,
  ui: state.ui
});
const mapDispatch = { login };
export default connect(mapStates, mapDispatch)(Login);
