import { StopOutlined } from '@ant-design/icons';
import { formatDate, formatDateNoTime } from '@lib/date';
import {
  Button,
  Table, Tag
} from 'antd';
import { ISubscription } from 'src/interfaces';

interface IProps {
  dataSource: ISubscription[];
  pagination: {};
  rowKey: string;
  onChange(): Function;
  loading: boolean;
  onCancelSubscriber: Function;
}

export function TableListSubscription({
  dataSource,
  pagination,
  rowKey,
  onChange,
  loading,
  onCancelSubscriber
}: IProps) {
  const columns = [
    {
      title: 'User',
      dataIndex: 'userInfo',
      render(data, records) {
        return (
          <span>
            {`${records?.userInfo?.name || records?.userInfo?.username || `${records?.userInfo?.firstName} ${records?.userInfo?.lastName}` || 'N/A'}`}
          </span>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'subscriptionType',
      render(subscriptionType: string) {
        switch (subscriptionType) {
          case 'recurring':
            return <Tag color="orange">Recurring</Tag>;
          case 'single':
            return <Tag color="purple">Non-recurring</Tag>;
          default: return <Tag color="orange">{subscriptionType}</Tag>;
        }
      }
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiredAt',
      render(date: Date, record) {
        if (record.subscriptionType !== 'recurring') {
          return  <span>{formatDateNoTime(date)}</span>;
        }

        if (record.subscriptionId && record.paymentGateway === 'ccbill' && record.status === 'active') {
          return <span>N/A</span>
        }
        return  <span>{formatDateNoTime(date)}</span>;
      }
    },
    {
      title: 'Start Reccuring Date',
      dataIndex: 'startRecurringDate',
      render(data, records) {
        return <span>{records.subscriptionType === 'recurring' ? formatDateNoTime(records.startRecurringDate) : 'N/A'}</span>;
      }
    },
    {
      title: 'Next Reccuring Date',
      dataIndex: 'nextRecurringDate',
      render(data, record) {
        if (record.subscriptionType === 'recurring' && record.subscriptionId && record.paymentGateway === 'ccbill' && record.status === 'active') {
          return formatDateNoTime(record.expiredAt);
        }

        return 'N/A';
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render(status: string) {
        switch (status) {
          case 'active':
            return <Tag color="green">Active</Tag>;
          case 'deactivated':
            return <Tag color="red">Deactivated</Tag>;
          default: return <Tag color="red">Deactivated</Tag>;
        }
      }
    },
    {
      title: 'Last Update',
      dataIndex: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Actions',
      dataIndex: 'status',
      render(data, records) {
        return (
          <Button disabled={records?.status !== 'active'} type="link" onClick={() => onCancelSubscriber(records._id)}>
            <StopOutlined />
            {' '}
            Cancel subscription
          </Button>
        );
      }
    }
  ];
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      pagination={pagination}
      onChange={onChange}
      loading={loading}
    />
  );
}
