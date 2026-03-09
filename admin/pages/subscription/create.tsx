import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { FormSubscription } from '@components/subscription/form-subscription';
import { subscriptionService } from '@services/subscription.service';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

class SubscriptionCreate extends PureComponent {
  state = {
    submiting: false
  };

  async submit(data) {
    try {
      if (!data.userId) {
        message.error('Please select user');
        return;
      }
      await this.setState({ submiting: true });
      await subscriptionService.create(data);
      message.success('Add new subscription successfully');
      // TODO - redirect
      Router.push('/subscription');
    } catch (e) {
      // TODO - check and show error here
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { submiting } = this.state;
    return (
      <>
        <Head>
          <title>New subscription</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Subscriptions', href: '/subscription' }, { title: 'New subscription' }]}
        />
        <Page>
          <FormSubscription onFinish={this.submit.bind(this)} submiting={submiting} />
        </Page>
      </>
    );
  }
}

export default SubscriptionCreate;
