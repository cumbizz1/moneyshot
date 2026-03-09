import {
  DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import Link from 'next/link';
import { ICategory } from 'src/interfaces';

interface IProps {
  dataSource: ICategory[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
  // eslint-disable-next-line react/require-default-props
  deleteCategory?: Function;
}

export function TableListCategory({
  deleteCategory,
  dataSource, rowKey, loading, pagination, onChange
}: IProps) {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name'
    },
    // {
    //   title: 'Slug',
    //   dataIndex: 'slug',
    //   render(slug: String) {
    //     return <span>{slug}</span>;
    //   }
    // },
    {
      title: 'Group',
      dataIndex: 'group',
      render(group: string) {
        switch (group) {
          case 'video':
            return <Tag color="blue">Video</Tag>;
          case 'gallery':
            return <Tag color="pink">Gallery</Tag>;
          case 'product':
            return <Tag color="red">Product</Tag>;
          case 'performer':
            return <Tag color="orange">Performer</Tag>;
          case 'post':
            return <Tag color="violet">Page</Tag>;
          case '':
            return <Tag color="green">All</Tag>;
          default: return <Tag color="default">{group}</Tag>;
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
      render: (data, record) => (
        <DropdownAction
          menuOptions={[
            {
              key: 'update',
              name: 'Update',
              children: (
                <Link
                  href={{
                    pathname: '/categories/update',
                    query: { id: record._id }
                  }}
                  as={`/categories/update?id=${record._id}`}
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
              onClick: () => deleteCategory && deleteCategory(record._id)
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
