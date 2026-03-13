import { EyeOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import Link from 'next/link';
import { IOrder } from 'src/interfaces';

interface IProps {
  dataSource: IOrder[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
  currencySymbol: string;
  currency: string
}

function OrderTableList({
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
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      sorter: true,
      render(orderNumber) {
        return (
          <span>
            {orderNumber || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render(name: string) {
        return (
          <span>
            {name}
          </span>
        );
      }
    },
    {
      title: 'Product type',
      dataIndex: 'productType',
      key: 'type',
      render(type: string) {
        switch (type) {
          case 'subscription_package': return <Tag color="orange">Membership Plan</Tag>;
          case 'digital': return <Tag color="blue">Digital Product</Tag>;
          case 'physical': return <Tag color="pink">Physical Product</Tag>;
          case 'gallery': return <Tag color="violet">Gallery</Tag>;
          case 'video': return <Tag color="red">Video</Tag>;
          default: return <Tag color="success">{type}</Tag>;
        }
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
            {record.totalPrice.toFixed(2)}
          </span>
        );
      }
    },
    {
      title: 'Delivery Status',
      dataIndex: 'deliveryStatus',
      render(status: string) {
        switch (status) {
          case 'created':
            return <Tag color="default">Created</Tag>;
          case 'failed':
            return <Tag color="red">Failed</Tag>;
          case 'processing':
            return <Tag color="#FFCF00">Processing</Tag>;
          case 'shipping':
            return <Tag color="#00dcff">Shipping</Tag>;
          case 'delivered':
            return <Tag color="#00c12c">Delivered</Tag>;
          case 'refunded':
            return <Tag color="#f04134">Refunded</Tag>;
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
    },
    {
      title: '#',
      dataIndex: '_id',
      render(id: string) {
        return (
          <Link href={{ pathname: '/user/orders/detail', query: { id } }}>
            <a>
              <EyeOutlined />
            </a>
          </Link>
        );
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
export default OrderTableList;
