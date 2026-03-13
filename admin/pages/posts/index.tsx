import {
  DeleteOutlined,
  DownOutlined, EditOutlined, HomeOutlined
} from '@ant-design/icons';
import Page from '@components/common/layout/page';
import { SearchFilter } from '@components/post/search-filter';
import { formatDate } from '@lib/date';
import { getGlobalConfig } from '@services/config';
import { postService } from '@services/post.service';
import {
  Breadcrumb, Button,
  Dropdown, Menu, message, Table, Tag
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {}

class Posts extends PureComponent<IProps> {
  state = {
    pagination: {} as any,
    searching: false,
    list: [],
    limit: 10,
    filter: {} as any,
    sortBy: 'updatedAt',
    sort: 'asc'
  };

  componentDidMount() {
    this.search();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const pager = { ...pagination };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || '',
      // eslint-disable-next-line no-nested-ternary
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : ''
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
      filter, limit, sortBy, pagination,
      sort
    } = this.state;

    try {
      await this.setState({ searching: true });
      const resp = await postService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sortBy,
        sort
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

  async deletePost(id: string) {
    const { pagination } = this.state;
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await postService.delete(id);
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const config = getGlobalConfig();
    const columns = [
      {
        title: 'Title',
        dataIndex: 'title',
        render(data, record) {
          return (
            <Link
              href={{
                pathname: '/posts/update',
                query: {
                  id: record._id
                }
              }}
            >
              <a>{record.title}</a>
            </Link>
          );
        }
      },
      {
        title: 'Link',
        dataIndex: 'link',
        render(data, record) {
          return (
            <a aria-hidden href={`${config.NEXT_PUBLIC_SITE_URL}/page/${record.slug}`} target="_blank" rel="noreferrer">
              {`${config.NEXT_PUBLIC_SITE_URL}/page/${record.slug}`}
            </a>
          );
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status: string) {
          let color = 'default';
          switch (status) {
            case 'published': color = 'green';
              break;
            default: color = 'orange';
          }
          return (
            <Tag color={color} key={status}>
              {status === 'published' ? 'Active' : 'Inactive'}
            </Tag>
          );
        }
      },
      {
        title: 'Last update',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      },
      {
        title: 'Actions',
        dataIndex: '_id',
        render: (id: string) => (
          <Dropdown
            overlay={(
              <Menu>
                <Menu.Item key="edit">
                  <Link
                    href={{
                      pathname: '/posts/update',
                      query: { id }
                    }}
                    as={`/posts/update?id=${id}`}
                  >
                    <a>
                      <EditOutlined />
                      {' '}
                      Update
                    </a>
                  </Link>
                </Menu.Item>
                <Menu.Item key="delete" onClick={this.deletePost.bind(this, id)}>
                  <span>
                    <DeleteOutlined />
                    {' '}
                    Delete
                  </span>
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
        )
      }
    ];
    return (
      <>
        <Head>
          <title>Posts</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Posts</Breadcrumb.Item>
          </Breadcrumb>
        </div>
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

export default Posts;
