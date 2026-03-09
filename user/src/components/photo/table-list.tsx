/* eslint-disable react/prop-types */
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import { Button, Table, Tag } from 'antd';
import Link from 'next/link';
import React from 'react';

interface TableListPhotosIProp {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  onDelete: Function;
  currencySymbol: string;
  currency: string;
}

export function TableListPhotos({
  dataSource,
  rowKey,
  loading,
  pagination,
  onChange,
  onDelete,
  currencySymbol,
  currency
}: TableListPhotosIProp) {
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true
    },
    {
      title: 'For Sale',
      dataIndex: 'isSalePhoto',
      key: 'isSalePhoto',
      sorter: true,
      render(isSale: boolean) {
        switch (isSale) {
          case true:
            return <Tag color="green">Yes</Tag>;
          case false:
            return <Tag color="red">No</Tag>;
          default: return null;
        }
      }
    },
    {
      title: `Price (${currency})`,
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      render(price: number) {
        return (
          <span>
            {currencySymbol}
            {price}
          </span>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="green">Active</Tag>;
          case 'inactive':
            return <Tag color="red">Inactive</Tag>;
          default: return <Tag color="default">{status}</Tag>;
        }
      }
    },
    {
      title: 'Last update',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      dataIndex: '_id',
      render: (id: string) => (
        <>
          <Button>
            <Link
              href={{
                pathname: '/model/my-video/update',
                query: { id }
              }}
              as={`/model/my-video/update/${id}`}
            >
              <a>
                <EditOutlined />
                {' '}
                Update
              </a>
            </Link>
          </Button>
          <Button onClick={onDelete.bind(this, id)}>
            <DeleteOutlined />
          </Button>
        </>
      )
    }
  ];

  return (
    <div className="table-responsive">
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={rowKey}
        loading={loading}
        pagination={pagination}
        onChange={onChange.bind(this)}
      />
    </div>
  );
}
