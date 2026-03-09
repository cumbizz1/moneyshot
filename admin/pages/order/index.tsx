/* eslint-disable no-nested-ternary */
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { OrderSearchFilter } from '@components/order';
import OrderTableList from '@components/order/table-list';
import { orderService } from '@services/index';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';

interface IProps {
  deliveryStatus: string;
  ui: IUIConfig;
}

class ModelOrderPage extends PureComponent<IProps> {
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
    const { deliveryStatus } = this.props;
    if (deliveryStatus) {
      await this.setState({ filter: { deliveryStatus } });
    }
    this.search();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const pager = { ...pagination };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || 'updatedAt',
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
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
      filter, limit, sort, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await orderService.detailsSearch({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      await this.setState({
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
    return (
      <>
        <Head>
          <title>Orders</title>
        </Head>
        <Page>
          <div className="main-container">
            <BreadcrumbComponent
              breadcrumbs={[
                { title: 'Orders', href: '/order' }
              ]}
            />
            <OrderSearchFilter
              onSubmit={this.handleFilter.bind(this)}
            />
            <OrderTableList
              dataSource={list}
              rowKey="_id"
              loading={searching}
              pagination={{ ...pagination, showSizeChanger: false }}
              onChange={this.handleTableChange.bind(this)}
              currencySymbol={ui.currencySymbol}
            />
          </div>
        </Page>
      </>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ui: state.ui
});

export default connect(mapStateToProps)(ModelOrderPage);
