import PaymentMethodSelect from '@components/payment/payment-method-select';
import { PackageGridCard } from '@components/subscription/grid-card';
import { getResponseError } from '@lib/utils';
import { paymentService, subscriptionService } from '@services/index';
import {
  Col, Divider, Layout, message, Row, Spin, Tooltip
} from 'antd';
import moment from 'moment';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { ISubscriptionPackage, IUIConfig, IUser } from 'src/interfaces';

import style from './upgrade-member.module.less';

interface IProps {
  ui: IUIConfig;
  user: IUser;
}

class UpgradeMemberShipPlan extends PureComponent<IProps> {
  static authenticate: boolean = true;

  state = {
    activePackageId: '',
    fetching: false,
    submiting: false,
    packages: [],
    step: 1,
    currentSubscription: false as any,
    blockUpgrade: false,
    showModal: false,
    selectedPackage: null
  };

  componentDidMount() {
    const { user } = this.props;
    const { query } = Router;
    if (user.isSubscribed) {
      Router.back();
      return;
    }
    if (query && query.packageId) {
      this.setState({ activePackageId: query.packageId });
    }
    this.getPackages();
    this.loadCurrentSubscription();
  }

  onPaymentSelect(data) {
    this.processUpgrade(data);
  }

  handleUpgrade(data: ISubscriptionPackage) {
    this.setState({
      selectedPackage: data,
      showModal: true
    });
  }

  onCancel() {
    this.setState({
      step: 1,
      submiting: false,
      selectedPackage: null,
      showModal: false
    });
  }

  async processUpgrade(data) {
    try {
      const { selectedPackage } = this.state;
      await this.setState({ submiting: true, step: 2 });
      const resp = await paymentService.subscribe({
        packageId: selectedPackage._id,
        ...data,
        method: data.curoMethod
      });
      if (resp.data && resp.data.paymentUrl) {
        window.location.href = resp.data.paymentUrl;
      }
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      this.setState({ submiting: false });
    }
  }

  async getPackages() {
    try {
      await this.setState({ fetching: true });
      const resp = await (
        await subscriptionService.searchPackage({
          limit: 99,
          sortBy: 'ordering',
          sort: 'asc'
        })
      ).data;
      this.setState({ packages: resp.data, fetching: false });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
      this.setState({ fetching: false });
    }
  }

  async loadCurrentSubscription() {
    const data = await subscriptionService.current();
    const record = data.data;
    const blockUpgrade = record?.paymentGateway === 'ccbill' && record?.subscriptionId && record?.status === 'active' && moment().isBefore(record.expiredAt);
    await this.setState({
      currentSubscription: data.data,
      blockUpgrade
    });
  }

  render() {
    const { ui } = this.props;
    const {
      packages, fetching, step, submiting, activePackageId, currentSubscription, blockUpgrade,
      showModal
    } = this.state;

    return (
      <Layout>
        <Head>
          <title>{`${ui.siteName} | Upgrade membership plan`}</title>
        </Head>
        <div className="main-container">
          <div className={style['register-box']}>
            <h3 className="page-heading">
              <span className="box">UPGRADE MEMBERSHIP PLAN</span>
            </h3>
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
              <Tooltip title="Payment">
                <span className={step === 3 ? 'step-box active' : 'step-box'}>
                  2
                </span>
              </Tooltip>
            </Divider>
            {blockUpgrade && (
              <Row>
                <Col span={24}>
                  {!currentSubscription?.subscriptionId
                    ? (
                      <p>
                        You have cancelled your subscription from auto-renewing. Your current subscription will expire on
                        {moment(currentSubscription.expiredAt).format('LL')}
                      </p>
                    )
                    : (
                      <p>
                        Your current subscription will expire on
                        {moment(currentSubscription.expiredAt).format('LL')}
                      </p>
                    )}
                </Col>
              </Row>
            )}
            {!blockUpgrade && !fetching && step === 1 && (
              <div className="packages-li">
                <Row>
                  {packages.length > 0 ? (
                    packages.map((p: ISubscriptionPackage) => (
                      <Col lg={6} md={12} xs={24} key={p._id}>
                        <PackageGridCard
                          isActive={
                            activePackageId && activePackageId === p._id
                          }
                          onSelect={this.handleUpgrade.bind(this, p)}
                          item={p}
                          submiting={submiting}
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
              <div className="text-center">
                <h4>
                  Redirecting to payment gateway, do not reload page at this
                  time.
                </h4>
                <Spin />
              </div>
            )}
          </div>
        </div>
        <PaymentMethodSelect
          onSelect={this.onPaymentSelect.bind(this)}
          onCancel={this.onCancel.bind(this)}
          showModal={showModal}
        />
      </Layout>
    );
  }
}
const mapStatesToProps = (state: any) => ({
  ui: { ...state.ui },
  user: { ...state.user.current }
});

const mapDispatchToProps = {};

export default connect(
  mapStatesToProps,
  mapDispatchToProps
)(UpgradeMemberShipPlan);
