import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import React from 'react';
import { ITransaction } from 'src/interfaces';

interface IProps {
  dataSource: ITransaction[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
  currencySymbol: string;
  currency: string;
}

function PaymentTableList({
  dataSource,
  pagination,
  rowKey,
  loading,
  onChange,
  currencySymbol,
  currency
}: IProps) {
  const columns = [
    {
      title: 'ID',
      sorter: true,
      dataIndex: 'orderNumber'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render(type: string) {
        switch (type) {
          case 'subscription_package': return <Tag color="orange">Membership Plan</Tag>;
          case 'product': return <Tag color="blue">Product</Tag>;
          case 'sale_video': return <Tag color="pink">Video</Tag>;
          case 'sale_gallery': return <Tag color="violet">Gallery</Tag>;
          default: return <Tag color="orange">{type}</Tag>;
        }
      }
    },
    {
      title: 'Description',
      render(data, record) {
        return record.details?.map((p) => (
          <p key={p._id}>
            <span>{p.name}</span>
          </p>
        ));
      }
    },
    {
      title: `Original Price (${currency})`,
      dataIndex: 'originalPrice',
      sorter: true,
      render(data, record) {
        return (
          <span>
            {currencySymbol}
            {(record.originalPrice && record.originalPrice.toFixed(2))
              || record.totalPrice.toFixed(2)}
          </span>
        );
      }
    },
    {
      title: `Total Price (${currency})`,
      dataIndex: 'totalPrice',
      sorter: true,
      render(data, record) {
        return (
          <span>
            {currencySymbol}
            {record.totalPrice && record.totalPrice.toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Discount',
      dataIndex: 'couponInfo',
      render(data, record) {
        return record.couponInfo ? (
          <span>
            {`${(record?.couponInfo?.value || 0) * 100}%`}
          </span>
        ) : (
          ''
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'created':
            return <Tag color="#FFCF00">Created</Tag>;
          case 'failed':
            return <Tag color="red">Failed</Tag>;
          case 'pending':
            return <Tag color="#00dcff">Pending</Tag>;
          case 'paid':
            return <Tag color="#00c12c">Paid</Tag>;
          case 'refunded':
            return <Tag color="danger">Refunded</Tag>;
          default: return <Tag color="#FFCF00">{status}</Tag>;
        }
      }
    },
    {
      title: 'Date',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    }
  ];
  return (
    <div className="table-responsive">
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        rowKey={rowKey}
        loading={loading}
        onChange={onChange.bind(this)}
      />
    </div>
  );
}
export default PaymentTableList;
