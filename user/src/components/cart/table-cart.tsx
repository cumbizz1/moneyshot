import { DeleteOutlined } from '@ant-design/icons';
import { ImageProduct } from '@components/product/image-product';
import {
  Button, InputNumber, message,
  Table
} from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IProduct } from 'src/interfaces';

interface IProps {
  dataSource: IProduct[];
  rowKey: string;
  // eslint-disable-next-line react/require-default-props
  loading?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types, react/require-default-props
  onChange?: Function;
  // eslint-disable-next-line react/require-default-props
  onChangeQuantity?: Function;
  // eslint-disable-next-line react/require-default-props
  onRemoveItemCart?: Function;
  currencySymbol: string;
  currency: string;
}

export class TableCart extends PureComponent<IProps> {
  timeout = 0;

  render() {
    const {
      dataSource,
      rowKey,
      loading,
      onRemoveItemCart,
      onChangeQuantity,
      currencySymbol,
      currency
    } = this.props;
    const changeQuantity = async (item, quantity: any) => {
      if (!quantity) return;
      try {
        if (this.timeout) clearTimeout(this.timeout);
        let remainQuantity = quantity;
        this.timeout = window.setTimeout(async () => {
          if (quantity > item.stock) {
            remainQuantity = item.stock;
            message.error('Quantity must not be larger than quantity in stock');
          }
          onChangeQuantity(item, remainQuantity);
        }, 300);
      } catch (error) {
        message.error('An error occurred, please try again!');
      }
    };
    const columns = [
      {
        title: '',
        dataIndex: 'image',
        render(data, record) {
          return (
            <Link
              href={{ pathname: '/store/[id]', query: { id: record?.slug || record?._id } }}
              as={`/store/${record?.slug || record?._id}`}
            >
              <a><ImageProduct product={record} /></a>
            </Link>
          );
        }
      },
      {
        title: 'Name',
        dataIndex: 'name',
        render(name) {
          return (
            <div style={{
              textTransform: 'capitalize', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}
            >
              {name}
            </div>
          );
        }
      },
      {
        title: `Price (${currency})`,
        dataIndex: 'price',
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
        title: 'Quantity',
        dataIndex: 'quantity',
        render(data, record) {
          return (
            <InputNumber
              disabled={record.type === 'digital'}
              value={record.quantity || 1}
              onChange={(value) => changeQuantity(record, value)}
              type="number"
              min={1}
              max={record.stock}
            />
          );
        }
      },
      {
        title: 'Action',
        dataIndex: '',
        render(data, record) {
          return (
            <Button className="danger" onClick={() => onRemoveItemCart(record)}>
              <DeleteOutlined />
            </Button>
          );
        }
      }
    ];
    return (
      <div className="table-responsive table-cart">
        <Table
          dataSource={dataSource}
          columns={columns}
          rowKey={rowKey}
          loading={loading}
          pagination={false}
        />
      </div>
    );
  }
}
