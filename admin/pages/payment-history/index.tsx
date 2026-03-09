/* eslint-disable no-nested-ternary */
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { SearchFilter } from '@components/common/search-filter';
import { TableListPaymentTransaction } from '@components/payment/table-list-payment';
import { orderService } from '@services/order.service';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';

interface IProps {
  ui: IUIConfig;
}

class PaymentTransaction extends PureComponent<IProps> {
  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'updatedAt',
    sort: 'desc'
  };

  async componentDidMount() {
    this.search();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'updatedAt',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search(page = 1) {
    const {
      limit, filter, sort, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await orderService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      this.setState({ searching: false });
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const { ui } = this.props;
    const statuses = [
      {
        key: '',
        text: 'All status'
      },
      {
        key: 'created',
        text: 'Created'
      },
      {
        key: 'paid',
        text: 'Paid'
      },
      {
        key: 'failed',
        text: 'Failed'
      }
    ];
    const type = [
      {
        key: '',
        text: 'All type'
      },
      {
        key: 'subscription_package',
        text: 'Subscription'
      },
      {
        key: 'product',
        text: 'Product'
      },
      {
        key: 'video',
        text: 'Video'
      }
      // {
      //   key: 'gallery',
      //   text: 'Gallery'
      // }
    ];

    return (
      <>
        <Head>
          <title>Payment History</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Payment History' }]} />
        <Page>
          <SearchFilter type={type} dateRange statuses={statuses} onSubmit={this.handleFilter.bind(this)} />
          <div style={{ marginBottom: '20px' }} />
          <TableListPaymentTransaction
            dataSource={list}
            rowKey="_id"
            loading={searching}
            pagination={{ ...pagination, showSizeChanger: false }}
            onChange={this.handleTableChange.bind(this)}
            currencySymbol={ui.currencySymbol}
          />
        </Page>
      </>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ui: state.ui
});

export default connect(mapStateToProps)(PaymentTransaction);
