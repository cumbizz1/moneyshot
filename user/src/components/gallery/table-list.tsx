import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { CoverGallery } from '@components/gallery/cover-gallery';
import { formatDate } from '@lib/date';
import { Button, Table, Tag } from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  // eslint-disable-next-line react/require-default-props
  deleteGallery?: Function;
}

export class TableListGallery extends PureComponent<IProps> {
  render() {
    const {
      dataSource,
      rowKey,
      loading,
      pagination,
      onChange,
      deleteGallery
    } = this.props;
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
        title: 'Status',
        dataIndex: 'status',
        render(status: string) {
          switch (status) {
            case 'active':
              return <Tag color="green">Active</Tag>;
            case 'inactive':
              return <Tag color="#FFCF00">Inactive</Tag>;
            default:
              break;
          }
          return <Tag color="default">{status}</Tag>;
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
          <div>
            <Button className="info">
              <Link
                href={{
                  pathname: '/model/my-gallery/update',
                  query: { id: record._id }
                }}
              >
                <a>
                  <EditOutlined />
                  {' '}
                  Edit
                </a>
              </Link>
            </Button>
            <Button
              onClick={() => deleteGallery && deleteGallery(record._id)}
              className="danger"
            >
              <DeleteOutlined />
            </Button>
          </div>
        )
      }
    ];
    return (
      <div className="table-responsive">
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey={rowKey}
          loading={loading}
          pagination={pagination}
          // eslint-disable-next-line react/jsx-no-bind
          onChange={onChange.bind(this)}
        />
      </div>
    );
  }
}
