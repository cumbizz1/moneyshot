import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { ImageProduct } from '@components/product/image-product';
import { formatDate } from '@lib/date';
import {
  Table, Tag
} from 'antd';
import Link from 'next/link';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteProduct?: Function;
  currencySymbol?: string;
}

export function TableListProduct({
  deleteProduct, currencySymbol,
  dataSource, rowKey, loading, pagination, onChange
}: IProps) {
  const columns = [
    {
      title: '',
      dataIndex: 'image',
      render(data, record) {
        return <ImageProduct product={record} />;
      }
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true
    },
    {
      title: 'Price',
      dataIndex: 'price',
      sorter: true,
      render(token: number) {
        return (
          <span>
            {currencySymbol}
            {token}
          </span>
        );
      }
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      sorter: true,
      render(stock: number, record) {
        return <span>{record.type === 'physical' ? stock : null}</span>;
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render(type: string) {
        switch (type) {
          case 'physical':
            return <Tag color="orange">Physical</Tag>;
          case 'digital':
            return <Tag color="blue">Digital</Tag>;
          default: return <Tag color="default">{type}</Tag>;
        }
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
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
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      render: (id: string) => (
        <DropdownAction
          menuOptions={[
            {
              key: 'update',
              name: 'Update',
              children: (
                <Link
                  href={{
                    pathname: '/product/update',
                    query: { id }
                  }}
                  as={`/product/update?id=${id}`}
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
              onClick: () => deleteProduct && deleteProduct(id)
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

TableListProduct.defaultProps = {
  deleteProduct() {},
  currencySymbol: '$'
};

export default TableListProduct;
