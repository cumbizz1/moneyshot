import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import Link from 'next/link';
import { ISubscriptionPackage } from 'src/interfaces';

interface IProps {
  dataSource: ISubscriptionPackage[];
  rowKey: string;
  deletePackage: Function;
  loading: boolean;
  onChange: Function;
  total: number;
  currencySymbol?: string;
}

export function SubscriptionPackageTable({
  deletePackage, dataSource, rowKey, loading, onChange, total, currencySymbol
}: IProps) {
  const Columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'center' as 'center',
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
      title: 'Initial Period',
      dataIndex: 'initialPeriod',
      key: 'initialPeriod',
      align: 'center' as 'center'
    },
    {
      title: 'Recurring Price',
      dataIndex: 'recurringPrice',
      key: 'recurringPrice',
      align: 'center' as 'center',
      render(recurringPrice: number) {
        return (
          <span>
            {currencySymbol}
            {recurringPrice}
          </span>
        );
      }
    },
    {
      title: 'Recurring Period',
      dataIndex: 'recurringPeriod',
      key: 'recurringPeriod',
      align: 'center' as 'center'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render(type: string) {
        switch (type) {
          case 'single':
            return <Tag color="blue">Single</Tag>;
          case 'recurring':
            return <Tag color="orange">Recurring</Tag>;
          default: return <Tag color="default">{type}</Tag>;
        }
      }
    },
    {
      title: 'Ordering',
      dataIndex: 'ordering',
      key: 'ordering',
      align: 'center' as 'center'
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render(status: boolean) {
        switch (status) {
          case true:
            return <Tag color="green">Active</Tag>;
          case false:
            return <Tag color="red">Inactive</Tag>;
          default: return <Tag color="default">{status}</Tag>;
        }
      }
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render(data, record: ISubscriptionPackage) {
        return formatDate(record.updatedAt);
      }
    },
    {
      title: 'Action',
      dataIndex: '_id',
      key: 'action',
      render: (id: string) => (
        <DropdownAction
          menuOptions={[
            {
              key: 'update',
              name: 'Update',
              children: (
                <Link
                  href={{
                    pathname: '/subscription-package/update',
                    query: { id }
                  }}
                  as={`/subscription-package/update?id=${id}`}
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
              onClick: () => deletePackage && deletePackage(id)
            }
          ]}
        />
      )
    }
  ];
  return (
    <Table
      dataSource={dataSource}
      columns={Columns}
      pagination={{
        total,
        pageSize: 10
      }}
      rowKey={rowKey}
      loading={loading}
      onChange={onChange.bind(this)}
    />
  );
}

SubscriptionPackageTable.defaultProps = {
  currencySymbol: '$'
};

export default SubscriptionPackageTable;
