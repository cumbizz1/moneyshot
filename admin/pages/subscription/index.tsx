import { BreadcrumbComponent } from '@components/common/breadcrumb';
import Page from '@components/common/layout/page';
import { SearchFilter } from '@components/common/search-filter';
import { TableListSubscription } from '@components/subscription/table-list-subscription';
import { getResponseError } from '@lib/utils';
import { subscriptionService } from '@services/subscription.service';
import { message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { ISubscription } from 'src/interfaces';

interface IProps {}
interface IStates {
  subscriptionList: ISubscription[];
  loading: boolean;
  pagination: {
    pageSize: number;
    current: number;
    total: number;
  };
  sort: string;
  sortBy: string;
  filter: {};
}

class SubscriptionPage extends PureComponent<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      subscriptionList: [],
      loading: false,
      pagination: {
        pageSize: 10,
        current: 1,
        total: 0
      },
      sort: 'desc',
      sortBy: 'updatedAt',
      filter: {}
    };
  }

  componentDidMount() {
    this.getData();
  }

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.getData();
  }

  async handleTabChange(data) {
    const { pagination } = this.state;
    await this.setState({ pagination: { ...pagination, current: data.current } });
    this.getData();
  }

  async onCancelSubscriber(id: string) {
    if (!window.confirm('Confirm to cancel this subscription')) {
      return;
    }
    try {
      await subscriptionService.cancelSubscription(id);
      this.getData();
      message.success('This subscription have been deactivated');
    } catch (error) {
      const err = await Promise.resolve(error);
      message.error(getResponseError(err));
    }
  }

  async getData() {
    const {
      filter, sort, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await subscriptionService.search({
        ...filter,
        sort,
        sortBy,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      await this.setState({
        subscriptionList: resp.data.data,
        pagination: { ...pagination, total: resp.data.total }
      });
    } catch (error) {
      message.error(getResponseError(error) || 'An error occured. Please try again.');
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { subscriptionList, pagination, loading } = this.state;
    return (
      <>
        <Head>
          <title>Subscriptions</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Subscriptions' }]} />
        <Page>
          <SearchFilter dateRange onSubmit={this.handleFilter.bind(this)} />
          <div style={{ marginBottom: '20px' }} />
          <TableListSubscription
            dataSource={subscriptionList}
            pagination={{ ...pagination, showSizeChanger: false }}
            loading={loading}
            onChange={this.handleTabChange.bind(this)}
            rowKey="_id"
            onCancelSubscriber={this.onCancelSubscriber.bind(this)}
          />
        </Page>
      </>
    );
  }
}

export default SubscriptionPage;
