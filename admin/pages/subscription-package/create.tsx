import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { FormSubscriptionPackage } from '@components/subscription-package/form';
import { getResponseError } from '@lib/utils';
import { Layout, message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { ISubscriptionPackageCreate } from 'src/interfaces';
import { subscriptionPackageService } from 'src/services';

interface IProps { }

interface IStates {
  submiting: boolean;
}

class SubscriptionPackageCreatePage extends PureComponent<IProps, IStates> {
  state = { submiting: false };

  async handleCreate(data: ISubscriptionPackageCreate) {
    try {
      await this.setState({ submiting: true });
      await subscriptionPackageService.create(data);
      message.success('Created successfully');
      Router.push('/subscription-package');
    } catch (e) {
      const err = Promise.resolve(e);
      message.error(getResponseError(err));
      this.setState({ submiting: false });
    }
  }

  render() {
    const { submiting } = this.state;
    return (
      <Layout>
        <Head>
          <title>New Subscription Package</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <BreadcrumbComponent
            breadcrumbs={[{ title: 'Subscription Packages', href: '/subscription-package' }, { title: 'New subscription package' }]}
          />
        </div>
        <Page>
          <FormSubscriptionPackage onFinish={this.handleCreate.bind(this)} submiting={submiting} />
        </Page>
      </Layout>
    );
  }
}

export default SubscriptionPackageCreatePage;
