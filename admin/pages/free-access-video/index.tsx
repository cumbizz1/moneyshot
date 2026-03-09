import { BreadcrumbComponent, SearchFilter } from '@components/common';
import Page from '@components/common/layout/page';
import { videoService } from '@services/index';
import {
  Layout, message, Switch, Table
} from 'antd';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { IUser } from 'src/interfaces';

function FreeVideoAccess() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    current: 1,
    total: 0
  });

  const search = async (query = {}) => {
    try {
      setLoading(true);
      const resp = await videoService.searchUsersViewFreeVideo({
        ...query,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize
      });
      setUsers(resp.data.data);
      setPagination({
        ...pagination,
        total: resp.data.total
      });
    } catch (err) {
      message.error(err?.message || 'Error searching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, [pagination.current]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (values) => {
    setPagination({
      ...pagination,
      current: 1
    });
    search(values);
  };

  const handleUpdateAccess = async (userId: string, hasAccess: boolean) => {
    try {
      setSubmitting(true);
      await videoService.updateFreeVideoAccess(userId, { hasFreeVideoAccess: hasAccess });
      message.success('User access updated successfully');
      search();
    } catch (err) {
      message.error(err?.message || 'Error updating user access');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (_, record: IUser) => (
        <div>
          <div>{record.name}</div>
          <small>{record.email}</small>
        </div>
      )
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'Free Video Access',
      dataIndex: 'hasFreeVideoAccess',
      key: 'hasFreeVideoAccess',
      render: (hasAccess: boolean, record: IUser) => (
        <Switch
          checked={hasAccess}
          onChange={(checked) => handleUpdateAccess(record._id, checked)}
          loading={submitting}
        />
      )
    }
  ];

  return (
    <Layout>
      <Head>
        <title>Free Access Videos</title>
      </Head>
      <BreadcrumbComponent breadcrumbs={[{ title: 'Free Access Videos' }]} />
      <Page>
        <SearchFilter
          keyword
          onSubmit={handleSearch}
        />
        <div style={{ marginBottom: '20px' }} />

        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Page>
    </Layout>
  );
}

export default FreeVideoAccess;
