import { formatDate } from '@lib/date';
import {
  Table, Tag
} from 'antd';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  // eslint-disable-next-line react/require-default-props
  currencySymbol?: string;
}

export function TableListPaymentTransaction({
  dataSource, rowKey, loading, pagination, onChange, currencySymbol
}: IProps) {
  const columns = [
    {
      title: 'User',
      dataIndex: 'buyer',
      key: 'buyer',
      render(buyer) {
        return (
          <div>
            {buyer?.name || buyer?.username || `${buyer?.firstName || 'N/'} ${buyer?.lastName || 'A'}` || 'N/A'}
          </div>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render(type: string) {
        switch (type) {
          case 'subscription_package': return <Tag color="orange">Subscription Package</Tag>;
          case 'product': return <Tag color="blue">Product</Tag>;
          case 'sale_video': return <Tag color="pink">Video</Tag>;
          case 'sale_gallery': return <Tag color="violet">Gallery</Tag>;
          default: return <Tag color="orange">{type}</Tag>;
        }
      }
    },
    {
      title: 'Products',
      render(record) {
        return (record?.details || []).map((p) => (
          <p key={p._id}>
            <span style={{ textTransform: 'capitalize' }}>{p.name}</span>
          </p>
        ));
      }
    },
    {
      title: 'Original price',
      dataIndex: 'originalPrice',
      render(originalPrice, record) {
        return (
          <span>
            {currencySymbol}
            {(originalPrice || record.totalPrice || 0).toFixed(2)}
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
            {`${record.couponInfo.value * 100}%`}
          </span>
        ) : '';
      }
    },
    {
      title: 'End Price',
      dataIndex: 'totalPrice',
      render(totalPrice, record) {
        return (
          <span>
            {currencySymbol}
            {(totalPrice || record.originalPrice || 0).toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Payment status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'created':
            return <Tag color="default">Created</Tag>;
          case 'paid':
            return <Tag color="green">Paid</Tag>;
          case 'failed':
            return <Tag color="red">Failed</Tag>;
          default: return <Tag color="red">{status}</Tag>;
        }
      }
    },
    {
      title: 'Last update',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    }
  ];
  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      rowKey={rowKey}
      loading={loading}
      pagination={pagination}
      onChange={onChange.bind(this)}
    />
  );
}
