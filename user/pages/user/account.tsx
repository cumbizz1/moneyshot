import './index.module.less';

import Page from '@components/common/layout/page';
import { UserAccountForm } from '@components/user/account-form';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { formatDate } from '@lib/date';
import { getResponseError } from '@lib/utils';
import { authService } from '@services/auth.service';
import { subscriptionService } from '@services/subscription.service';
import { userService } from '@services/user.service';
import {
  Button,
  Layout, message, Tabs
} from 'antd';
import moment from 'moment';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUser, IUserFormData } from 'src/interfaces/user';
import {
  updateCurrentUserAvatar, updatePassword,
  updateUser
} from 'src/redux/user/actions';

interface IProps {
  user: IUser;
  updating: boolean;
  updateUser: Function;
  updateCurrentUserAvatar: Function;
  updatePassword: Function;
  updateSuccess: boolean;
  error: any;
}

class UserAccountSettingPage extends PureComponent<IProps> {
  static authenticate = true;

  state = {
    pwUpdating: false,
    cancelSubmiting: false,
    currentSubscription: false as any,
    isSubscribe: false
  };

  componentDidMount() {
    this.loadCurrentSubscription();
  }

  componentDidUpdate(preProps: IProps) {
    const { error, updateSuccess } = this.props;
    if (error !== preProps.error) {
      message.error(getResponseError(error));
    }
    if (updateSuccess && updateSuccess !== preProps.updateSuccess) {
      message.success('Changes saved.');
    }
  }

  onFinish(data: IUserFormData) {
    const { updateUser: handleUpdateUser } = this.props;
    handleUpdateUser(data);
  }

  uploadAvatar(data) {
    const { updateCurrentUserAvatar: updateCurrentAvatar } = this.props;
    updateCurrentAvatar(data.response.data.url);
  }

  updatePassword(data: any) {
    const { updatePassword: handleUpdatePassword } = this.props;
    handleUpdatePassword(data.password);
  }

  async loadCurrentSubscription() {
    const data = await subscriptionService.current();
    const record = data.data;
    const isSubscribe = record ? moment().isBefore(record.expiredAt) : false;
    await this.setState({
      currentSubscription: record,
      isSubscribe
    });
  }

  async cancelSubscription() {
    if (!window.confirm('By agreeing to cancel the subscription, your billing cycle ends.')) return;
    try {
      await this.setState({ cancelSubmiting: true });
      await subscriptionService.cancelSubscription();
      window.location.reload();
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later');
    } finally {
      this.setState({ cancelSubmiting: false });
    }
  }

  render() {
    const { user, updating } = this.props;
    const {
      pwUpdating, cancelSubmiting, currentSubscription, isSubscribe
    } = this.state;
    const uploadHeader = {
      authorization: authService.getToken()
    };
    return (
      <Layout>
        <Head>
          <title>Account Settings</title>
        </Head>
        <div className="main-container">
          <Page>
            <Tabs
              defaultActiveKey="basic"
              tabPosition="top"
              className="nav-tabs"
            >
              <Tabs.TabPane tab={<span>Basic Info</span>} key="basic">
                <UserAccountForm
                  onFinish={this.onFinish.bind(this)}
                  updating={updating}
                  user={user}
                  options={{
                    uploadHeader,
                    avatarUrl: userService.getAvatarUploadUrl(),
                    uploadAvatar: this.uploadAvatar.bind(this)
                  }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Change password</span>} key="password">
                <UpdatePaswordForm
                  onFinish={this.updatePassword.bind(this)}
                  updating={pwUpdating}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Membership plan</span>} key="membership">
                {currentSubscription === false && <p>Loading...</p>}
                {isSubscribe && (
                  <div className="membership">
                    {currentSubscription?.subscriptionType === 'recurring' && currentSubscription.status === 'active' && !!currentSubscription.subscriptionId
                      ? (
                        <>
                          <p>
                            Your membership will be renewed on
                            {' '}
                            {formatDate(currentSubscription.expiredAt, 'LL')}
                          </p>
                          <p><Button className="primary" loading={cancelSubmiting} disabled={cancelSubmiting} onClick={this.cancelSubscription.bind(this)}>Click here to cancel your subscription plan</Button></p>
                        </>
                      )
                      : (
                        <p>
                          Your membership will expire on
                          {' '}
                          {formatDate(user.memberShipExpiredAt, 'LL')}
                        </p>
                      )}
                  </div>
                )}
                {!isSubscribe && currentSubscription !== false && <p><Link href="/user/upgrade-membership"><a>Click here to upgrade your membership plan</a></Link></p>}
              </Tabs.TabPane>
            </Tabs>
          </Page>
        </div>
      </Layout>
    );
  }
}
const mapStates = (state) => ({
  user: state.user.current,
  updating: state.user.updating,
  error: state.user.error,
  updateSuccess: state.user.updateSuccess
});
const mapDispatch = { updateUser, updateCurrentUserAvatar, updatePassword };
export default connect(mapStates, mapDispatch)(UserAccountSettingPage);
