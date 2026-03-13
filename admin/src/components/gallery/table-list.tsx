import {
  DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import { DropdownAction } from '@components/common/dropdown-action';
import { CoverGallery } from '@components/gallery/cover-gallery';
import { formatDate } from '@lib/date';
import { Table, Tag } from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteGallery: Function;
}

export class TableListGallery extends PureComponent<IProps> {
  render() {
    const { deleteGallery } = this.props;
    const columns = [
      {
        title: '',
        render(data, record) {
          return <CoverGallery gallery={record} />;
        }
      },
      {
        title: 'Name',
        dataIndex: 'name'
      },
      {
        title: 'Total photos',
        dataIndex: 'numOfItems'
      },
      {
        title: 'Performers',
        dataIndex: 'performers',
        render(performers) {
          return (
            <div style={{ textTransform: 'capitalize' }}>
              {performers && performers.map((p) => <Tag>{p.name || p.username || `${p.firstName} ${p.lastName}` || 'N/A'}</Tag>)}
            </div>
          );
        }
      },
      // {
      //   title: 'For sale?',
      //   dataIndex: 'isSale',
      //   sorter: true,
      //   render(isSale: boolean) {
      //     switch (isSale) {
      //       case true:
      //         return <Tag color="green">Y</Tag>;
      //       case false:
      //         return <Tag color="red">N</Tag>;
      //       default: return <Tag color="default">{isSale}</Tag>;
      //     }
      //   }
      // },
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
                      pathname: '/gallery/update',
                      query: { id: record._id }
                    }}
                    as={`/gallery/update?id=${record._id}`}
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
                onClick: () => deleteGallery(record._id)
              }
            ]}
          />
        )
      }
    ];
    const {
      dataSource, rowKey, loading, pagination, onChange
    } = this.props;
    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={rowKey || '_id'}
        loading={loading}
        pagination={pagination}
        onChange={onChange.bind(this)}
      />
    );
  }
}
