import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ImageProduct } from '@components/product/image-product';
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
  deleteProduct?: Function;
  currencySymbol: string;
  currency: string;
}

export class TableListProduct extends PureComponent<IProps> {
  render() {
    const {
      dataSource,
      rowKey,
      loading,
      pagination,
      onChange,
      deleteProduct,
      currencySymbol,
      currency
    } = this.props;
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
        title: `Price (${currency})`,
        dataIndex: 'price',
        sorter: true,
        render(price: number) {
          return (
            <span>
              {currencySymbol}
              {price.toFixed(2)}
            </span>
          );
        }
      },
      {
        title: 'Stock',
        dataIndex: 'stock',
        sorter: true,
        render(stock: number) {
          return <span>{stock || 0}</span>;
        }
      },
      {
        title: 'Type',
        dataIndex: 'type',
        sorter: true,
        render(type: string) {
          switch (type) {
            case 'physical':
              return <Tag color="#7b5cbd">Physical</Tag>;
            case 'digital':
              return <Tag color="#00dcff">Digital</Tag>;
            default:
              break;
          }
          return <Tag color="">{type}</Tag>;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        sorter: true,
        render(status: string) {
          switch (status) {
            case 'active':
              return <Tag color="#00c12c">Active</Tag>;
            case 'inactive':
              return <Tag color="#FFCF00">Inactive</Tag>;
            default:
              break;
          }
          return <Tag color="default">{status}</Tag>;
        }
      },
      // {
      //   title: 'Performer',
      //   dataIndex: 'performer',
      //   render(data, record) {
      //     return <span>{record.performer && record.performer.username}</span>;
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
        render: (id: string) => (
          <>
            <Button className="info">
              <Link
                href={{
                  pathname: '/model/my-store/update',
                  query: { id }
                }}
                as={`/model/my-store/update?id=${id}`}
              >
                <a>
                  <EditOutlined />
                </a>
              </Link>
            </Button>
            <Button
              className="danger"
              onClick={deleteProduct && deleteProduct.bind(this, id)}
            >
              <DeleteOutlined />
            </Button>
          </>
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
          onChange={onChange.bind(this)}
        />
      </div>
    );
  }
}
