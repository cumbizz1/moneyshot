/* eslint-disable react/require-default-props */
import {
  DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import moment from 'moment';
import Link from 'next/link';
import { ICoupon } from 'src/interfaces';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteCoupon?: Function;
}

export function TableListCoupon({
  deleteCoupon,
  dataSource, rowKey, loading, pagination, onChange
}: IProps) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name'
    },
    {
      title: 'Code',
      dataIndex: 'code',
      render(code: string) {
        return <span>{code}</span>;
      }
    },
    {
      title: 'Discount percentage',
      dataIndex: 'value',
      render(value: number) {
        return (
          <span>
            {value * 100}
            %
          </span>
        );
      }
    },
    {
      title: 'Number of Uses',
      dataIndex: 'numberOfUses',
      render(numberOfUses: number) {
        return (
          <span>
            {numberOfUses}
          </span>
        );
      }
    },
    {
      title: 'Status',
      render(record: ICoupon) {
        if (moment().isAfter(moment(record.expiredDate))) {
          return <Tag color="red">Inactive</Tag>;
        }
        return <Tag color="green">Active</Tag>;
      }
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiredDate',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date, 'lll')}</span>;
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
      render: (data, record) => (
        <DropdownAction
          menuOptions={[
            {
              key: 'update',
              name: 'Update',
              children: (
                <Link
                  href={{
                    pathname: '/coupon/update',
                    query: { id: record._id }
                  }}
                  as={`/coupon/update?id=${record._id}`}
                >
                  <a>
                    <EditOutlined />
                    {' '}
                    Update
                  </a>
                </Link>
              )
            },
            {
              key: 'delete',
              name: 'Delete',
              children: (
                <span>
                  <DeleteOutlined />
                  {' '}
                  Delete
                </span>
              ),
              onClick: () => deleteCoupon && deleteCoupon(record._id)
            }
          ]}
        />
      )
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
