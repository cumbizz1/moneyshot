/* eslint-disable no-nested-ternary */
import { DownOutlined, EditOutlined } from '@ant-design/icons';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { SearchFilter } from '@components/common/search-filter';
import { formatDate } from '@lib/date';
import { userService } from '@services/user.service';
import {
  Avatar,
  Button, Dropdown, Menu, message, Table, Tag
} from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {
  status: string;
}

class Users extends PureComponent<IProps> {
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
    sortBy: 'createdAt',
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
      sortBy: sorter.field || '',
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
      limit, filter, sort, sortBy, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await userService.search({
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
        title: 'Username',
        dataIndex: 'username'
      },
      {
        title: 'Email',
        dataIndex: 'email'
      },
      {
        title: 'Roles',
        dataIndex: 'roles',
        render(roles: any) {
          return roles.map((role) => {
            switch (role) {
              case 'user':
                return <Tag color="blue" key={role}>User</Tag>;
              case 'admin':
                return <Tag color="red" key={role}>Admin</Tag>;
              default: return <Tag color="blue">User</Tag>;
            }
          });
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
        title: 'Verified Email',
        dataIndex: 'verifiedEmail',
        render(status) {
          switch (status) {
            case true:
              return <Tag color="green">Y</Tag>;
            case false:
              return <Tag color="red">N</Tag>;
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
        title: 'Actions',
        dataIndex: '_id',
        render(id: string) {
          return (
            <Dropdown
              overlay={(
                <Menu>
                  <Menu.Item key="edit">
                    <Link
                      href={{
                        pathname: '/users/update',
                        query: { id }
                      }}
                      as={`/users/update?id=${id}`}
                    >
                      <a>
                        <EditOutlined />
                        {' '}
                        Update
                      </a>
                    </Link>
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button>
                Actions
                {' '}
                <DownOutlined />
              </Button>
            </Dropdown>
          );
        }
      }
    ];
    return (
      <>
        <Head>
          <title>Users</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Users', href: '/users' }]} />
        <Page>
          <SearchFilter
            statuses={[{
              key: '',
              text: 'All status'
            }, {
              key: 'inactive',
              text: 'Inactive'
            }, {
              key: 'active',
              text: 'Active'
            },
            {
              key: 'pending-email-confirmation',
              text: 'Pending email confirmation'
            }]}
            keyword
            onSubmit={this.handleFilter.bind(this)}
          />
          <div style={{ marginBottom: '15px' }} />
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
export default Users;
