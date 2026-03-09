/* eslint-disable no-nested-ternary */
import {
  EditOutlined
} from '@ant-design/icons';
import { BreadcrumbComponent, DropdownAction } from '@components/common';
import Page from '@components/common/layout/page';
import { SearchFilter } from '@components/performer/search-filter';
import { formatDate } from '@lib/date';
import { performerService } from '@services/performer.service';
import {
  Avatar,
  message, Table, Tag
} from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {
  status: string;
}

class Performers extends PureComponent<IProps> {
  static async getInitialProps(ctx: NextPageContext) {
    return {
      ...ctx.query
    };
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [],
    limit: 10,
    filter: {} as any,
    sortBy: 'updatedAt',
    sort: 'desc'
  };

  async componentDidMount() {
    const { status } = this.props;
    if (status) {
      await this.setState({ filter: { status } });
    }
    this.search();
  }

  async handleTableChange(pagination, filters, sorter) {
    const pager = { ...pagination };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || 'updatedAt',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : ''
    });
    this.search(pager.current);
  }

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search(page = 1) {
    const {
      limit, sort, filter, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });

      const resp = await performerService.search({
        limit,
        offset: (page - 1) * limit,
        ...filter,
        sort,
        sortBy
      });
      this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      this.setState({ searching: false });
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const columns = [
      {
        title: 'Avatar',
        dataIndex: 'avatar',
        render(avatar) {
          return <Avatar src={avatar || '/no-avatar.png'} />;
        }
      },
      {
        title: 'Display name',
        dataIndex: 'name'
      },
      {
        title: 'Nick name',
        dataIndex: 'username'
      },
      {
        title: 'Gender',
        dataIndex: 'gender',
        render(gender) {
          switch (gender) {
            case 'male':
              return <Tag color="blue">Male</Tag>;
            case 'female':
              return <Tag color="pink">Female</Tag>;
            case 'transgender':
              return <Tag color="violet">Trans</Tag>;
            default: return <Tag color="blue">Male</Tag>;
          }
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status) {
          switch (status) {
            case 'active':
              return <Tag color="green">Active</Tag>;
            case 'inactive':
              return <Tag color="red">Inactive</Tag>;
            case 'pending-email-confirmation':
              return <Tag color="default">Pending</Tag>;
            default: return <Tag color="default">{status}</Tag>;
          }
        }
      },
      {
        title: 'CreatedAt',
        dataIndex: 'createdAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      },
      {
        title: '#',
        dataIndex: '_id',
        render(id: string) {
          return (
            <DropdownAction
              menuOptions={[
                {
                  key: 'update',
                  name: 'Update',
                  children: (
                    <Link
                      href={{
                        pathname: '/performer/update',
                        query: { id }
                      }}
                      as={`/performer/update?id=${id}`}
                    >
                      <a>
                        <EditOutlined />
                        {' '}
                        Update
                      </a>
                    </Link>
                  )
                }
              ]}
            />
          );
        }
      }
    ];
    return (
      <>
        <Head>
          <title>Performers</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Performers' }]} />
        <Page>
          <SearchFilter onSubmit={this.handleFilter.bind(this)} />
          <div style={{ marginBottom: '20px' }} />
          <Table
            dataSource={list}
            columns={columns}
            rowKey="_id"
            loading={searching}
            pagination={{ ...pagination, showSizeChanger: false }}
            onChange={this.handleTableChange.bind(this)}
          />
        </Page>
      </>
    );
  }
}

export default Performers;
