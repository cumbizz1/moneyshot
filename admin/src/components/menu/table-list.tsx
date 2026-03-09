import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { formatDate } from '@lib/date';
import { Table } from 'antd';
import Link from 'next/link';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  // eslint-disable-next-line react/require-default-props
  deleteMenu?: Function;
}

export function TableListMenu({
  deleteMenu,
  dataSource, rowKey, loading, pagination, onChange
}: IProps) {
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title'
    },
    {
      title: 'Path',
      dataIndex: 'path'
    },
    {
      title: 'Ordering',
      dataIndex: 'ordering'
    },
    // {
    //   title: 'Public',
    //   dataIndex: 'public',
    //   sorter: true,
    //   render(isPublic: boolean) {
    //     switch (isPublic) {
    //       case true:
    //         return <Tag color="green">Yes</Tag>;
    //       case false:
    //         return <Tag color="red">No</Tag>;
    //     }
    //   }
    // },
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
                    pathname: '/menu/update',
                    query: { id: record._id }
                  }}
                  as={`/menu/update?id=${record._id}`}
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
              onClick: () => deleteMenu && deleteMenu(record._id)
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

export default TableListMenu;
