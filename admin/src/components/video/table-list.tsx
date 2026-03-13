import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { ThumbnailVideo } from '@components/video/thumbnail-video';
import { formatDate } from '@lib/date';
import { Table, Tag, Tooltip } from 'antd';
import Link from 'next/link';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  // eslint-disable-next-line react/require-default-props
  deleteVideo?: Function;
  // eslint-disable-next-line react/require-default-props
  currencySymbol?: string;
}

export function TableListVideo({
  dataSource, rowKey, loading, pagination, onChange, deleteVideo, currencySymbol
}: IProps) {
  const columns = [
    {
      title: '',
      dataIndex: 'thumbnail',
      render(data, record) {
        return <ThumbnailVideo video={record} style={{ width: 50 }} />;
      }
    },
    {
      title: 'Title',
      dataIndex: 'title',
      render(title) {
        return (
          <Tooltip title={title}>
            <div style={{
              maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}
            >
              {title}
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'PPV?',
      dataIndex: 'isSale',
      render(isSale: boolean) {
        switch (isSale) {
          case true:
            return <Tag color="blue">Pay to view</Tag>;
          case false:
            return <Tag color="orange">Sub to view</Tag>;
          default: return <Tag color="default">{isSale}</Tag>;
        }
      }
    },
    {
      title: 'Price',
      dataIndex: 'price',
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
      title: 'Type',
      dataIndex: 'isSchedule',
      render(isSchedule: boolean) {
        switch (isSchedule) {
          case true:
            return <Tag color="orange">Upcoming</Tag>;
          case false:
            return <Tag color="blue">Recent</Tag>;
          default: return <Tag color="default">{isSchedule}</Tag>;
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
                    pathname: '/video/update',
                    query: { id }
                  }}
                  as={`/video/update?id=${id}`}
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
              onClick: () => deleteVideo && deleteVideo(id)
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
