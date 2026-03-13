/* eslint-disable no-nested-ternary */
import { RegisterForm } from '@components/auth/register-form';
import { PackageGridCard } from '@components/subscription/grid-card';
import storeHolder from '@lib/storeHolder';
import { getResponseError } from '@lib/utils';
import { authService, postService, subscriptionService } from '@services/index';
import {
  Button,
  Col,
  Divider,
  Layout,
  message,
  Row,
  Spin,
  Tooltip
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ISubscriptionPackage, IUIConfig } from 'src/interfaces';

import style from './register.module.less';

interface IProps {
  ui: IUIConfig;
  acceptanceSignup: {
    content: string;
    title: string;
    image: any;
    slug: string;
  };
  packageId: string;
}

class FanRegister extends PureComponent<IProps> {
  static authenticate: boolean = false;

  static layout = 'auth';

  static async getInitialProps(ctx) {
    const { query } = ctx;

    const store = storeHolder.getStore();
    const { settings } = store.getState() as any;

    if (!settings.acceptanceSignupId) {
      return { ...query };
    }
    let accepsingup = {} as any;
    try {
      accepsingup = await postService.findById(settings.acceptanceSignupId);
    // eslint-disable-next-line no-empty
    } catch {}

    return {
      acceptanceSignup: {
        // content: resp.data?.content,
        title: accepsingup?.data?.title,
        // image: resp.data?.image,
        slug: accepsingup?.data?.slug
      },
      ...query
    };
  }

  state = {
    fetching: false,
    submiting: false,
    packages: [],
    selectedPackage: null,
    step: 1
  };

  componentDidMount() {
    this.getPackages();
  }

  handleSkipStep = (isNext: boolean) => {
    const { step } = this.state;
    !isNext && step > 1 && this.setState({ step: step - 1 });
    isNext && step < 3 && this.setState({ step: step + 1 });
  };

  async handleRegister(data: any) {
    const { selectedPackage } = this.state;
    const payload = { ...data };
    if (selectedPackage) {
      payload.subscriptionPackageId = selectedPackage._id;
    }
    try {
      await this.setState({ submiting: true });
      const resp = await authService.register(payload);
      if (selectedPackage && resp.data) {
        window.location.href = resp.data.paymentUrl;
      }
      this.setState({ submiting: false, step: 3 });
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
      this.setState({ submiting: false });
    }
  }

  async getPackages() {
    const { packageId } = this.props;
    try {
      await this.setState({ fetching: true });
      const resp = await (
        await subscriptionService.searchPackage({
          limit: 99,
          sortBy: 'ordering',
          sort: 'asc'
        })
      ).data;
      this.setState({ fetching: false, packages: resp.data });
      if (packageId) {
        this.setState({ selectedPackage: resp.data.find((p) => p._id === packageId) });
      }
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error on get subscription packages, please try again later');
      this.setState({ fetching: false });
    }
  }

  render() {
    const { ui, acceptanceSignup } = this.props;
    const {
      step, packages, submiting, fetching, selectedPackage
    } = this.state;

    return (
      <Layout>
        <Head>
          <title>Register</title>
        </Head>
        <div
          className={style['login-page']}
          style={{
            backgroundImage: `url(${ui?.loginPlaceholderImage || '/bg-login.jpeg'
            })`
          }}
        >
          <div className="main-container">
            <div className={style['register-box']}>
              {ui.logoUrl && (
                <div className={style['login-logo']}>
                  <a href="/home">
                    <img alt="logo" src={ui.logoUrl} />
                  </a>
                </div>
              )}
              <div className="login-form">
                <h2 className="title">
                  <span>
                    {step === 1
                      ? 'SELECT YOUR MEMBERSHIP PLAN'
                      : step === 2
                        ? 'CREATE YOUR ACCOUNT'
                        : 'PAYMENT'}
                  </span>
                </h2>
                <div className="skip-btns">
                  <Button
                    disabled={step === 1}
                    type="link"
                    onClick={() => this.handleSkipStep(false)}
                  >
                    {'<<'}
                    {' '}
                    Back
                  </Button>
                  <Button
                    disabled={step > 1}
                    type="link"
                    onClick={() => this.handleSkipStep(true)}
                  >
                    Skip
                    {' '}
                    {'>>'}
                  </Button>
                </div>
                <Divider className="register-steps">
                  <Tooltip title="Choose your membership plan">
                    <span
                      aria-hidden
                      className={step > 0 ? 'step-box active' : 'step-box'}
                      onClick={() => this.setState({ step: 1 })}
                    >
                      1
                    </span>
                  </Tooltip>
                  <Tooltip title="Create your account">
                    <span
                      aria-hidden
                      className={step > 1 ? 'step-box active' : 'step-box'}
                      onClick={() => this.setState({ step: 2 })}
                    >
                      2
                    </span>
                  </Tooltip>
                  <Tooltip title="Payment">
                    <span className={step === 3 ? 'step-box active' : 'step-box'}>
                      3
                    </span>
                  </Tooltip>
                </Divider>
                {!fetching && step === 1 && (
                  <div className={style['packages-li']}>
                    <Row>
                      {packages.length > 0 ? (
                        packages.map((p: ISubscriptionPackage) => (
                          <Col lg={6} md={12} xs={24} key={p._id}>
                            <PackageGridCard
                              isActive={
                                selectedPackage && selectedPackage._id === p._id
                              }
                              onSelect={() => this.setState({ selectedPackage: p, step: 2 })}
                              item={p}
                              currencySymbol={ui.currencySymbol}
                            />
                          </Col>
                        ))
                      ) : (
                        <div className="text-center">
                          No subscription package was found
                        </div>
                      )}
                    </Row>
                  </div>
                )}
                {fetching && step === 1 && (
                  <div className="text-center">
                    <Spin />
                  </div>
                )}
                {step === 2 && (
                  <div className={style['login-box']}>
                    <RegisterForm
                      selectedPackage={selectedPackage}
                      onFinish={this.handleRegister.bind(this)}
                      submiting={submiting}
                      acceptanceSignup={acceptanceSignup}
                    />
                  </div>
                )}
                {step === 3 && (
                  <div className="text-center wh">
                    {selectedPackage ? (
                      <div>
                        <h4>
                          Redirecting to payment gateway, do not reload page at this time.
                        </h4>
                        <Spin />
                      </div>
                    ) : (
                      <div>
                        <p>
                          We have sent to you a verification email to address you registered with.
                        </p>
                        <p>
                          Upgrade your membership plan to access full contents.
                        </p>
                        <p>
                          <Link href="/auth/login">
                            <a>Click here to login</a>
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}
const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui }
});

const mapDispatchToProps = {};

export default connect(mapStatesToProps, mapDispatchToProps)(FanRegister);
