import { BreadcrumbComponent } from '@components/common';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { getResponseError } from '@lib/utils';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { FormSubscriptionPackage } from 'src/components/subscription-package/form';
import { ISubscriptionPackage, ISubscriptionPackageUpdate } from 'src/interfaces';
import { subscriptionPackageService } from 'src/services';

interface IProps {
  id: string;
}
interface IStates {
  submiting: boolean;
  loading: boolean;
  subscriptionPackage: Partial<ISubscriptionPackage>;
}

class SucscriptionPackageUpdatePage extends PureComponent<IProps, IStates> {
  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  constructor(props) {
    super(props);
    this.state = { submiting: false, loading: true, subscriptionPackage: {} };
  }

  componentDidMount() {
    const { id } = this.props;
    if (!id) {
      message.error('Package not found!');
      Router.push('/subscription-package');
      return;
    }
    this.getData();
  }

  async handleUpdate(data: ISubscriptionPackageUpdate) {
    try {
      const { id } = this.props;
      await this.setState({ submiting: true });
      await subscriptionPackageService.update(id, data);
      message.success('Updated successfully');
      Router.push('/subscription-package');
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err));
      this.setState({ submiting: false });
    }
  }

  async getData() {
    try {
      const { id } = this.props;
      const resp = await subscriptionPackageService.findOne(id);
      this.setState({ loading: false, subscriptionPackage: resp.data });
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err));
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, subscriptionPackage, submiting } = this.state;
    return (
      <>
        <Head>
          <title>Update Subscription Package</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <BreadcrumbComponent breadcrumbs={[{ title: 'Subscription Packages', href: '/subscription-package' }, { title: 'Update subscription package' }]} />
        </div>
        <Page>
          {loading ? <Loader />
            : <FormSubscriptionPackage onFinish={this.handleUpdate.bind(this)} submiting={submiting} subscriptionPackage={subscriptionPackage} />}
        </Page>
      </>
    );
  }
}
export default SucscriptionPackageUpdatePage;
