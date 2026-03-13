import {
  Col, DatePicker, Input,
  Row, Select
} from 'antd';
import { PureComponent } from 'react';

interface IProps {
  onSubmit: Function;
}

const deliveryStatuses = [
  {
    key: '',
    text: 'All delivery status'
  },
  {
    key: 'created',
    text: 'Created'
  },
  {
    key: 'processing',
    text: 'Processing'
  },
  {
    key: 'shipping',
    text: 'Shipping'
  },
  {
    key: 'delivered',
    text: 'Delivered'
  },
  {
    key: 'refunded',
    text: 'Refunded'
  }
];

const productTypes = [
  {
    key: '',
    text: 'All product type'
  },
  {
    key: 'subscription_package',
    text: 'Membership Plan'
  },
  {
    key: 'digital',
    text: 'Digital Product'
  },
  {
    key: 'physical',
    text: 'Physical Product'
  },
  {
    key: 'video',
    text: 'Video'
  }
  // {
  //   key: 'gallery',
  //   text: 'Gallery'
  // }
];

export class OrderSearchFilter extends PureComponent<IProps> {
  timeout: any;

  onSearchByKeyword = (q) => {
    const { onSubmit } = this.props;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.setState({ q }, () => onSubmit(this.state));
    }, 500);
  };

  render() {
    const { onSubmit } = this.props;
    return (
      <Row gutter={24}>
        <Col lg={6} xs={12}>
          <Input
            placeholder="Enter keyword"
            onChange={(evt) => this.onSearchByKeyword(evt.target.value)}
            onPressEnter={() => onSubmit(this.state)}
          />
        </Col>
        <Col lg={6} xs={12}>
          <Select
            onChange={(val) => this.setState({ productType: val }, () => onSubmit(this.state))}
            style={{ width: '100%' }}
            placeholder="Select product type"
            defaultValue=""
          >
            {productTypes.map((s) => (
              <Select.Option key={s.key} value={s.key}>
                {s.text || s.key}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col lg={6} xs={12}>
          <Select
            onChange={(val) => this.setState({ deliveryStatus: val }, () => onSubmit(this.state))}
            style={{ width: '100%' }}
            placeholder="Select delivery status"
            defaultValue=""
          >
            {deliveryStatuses.map((s) => (
              <Select.Option key={s.key} value={s.key}>
                {s.text || s.key}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col lg={6} xs={12}>
          <DatePicker.RangePicker
            onChange={(dates: [any, any], dateStrings: [string, string]) => this.setState({ fromDate: dateStrings[0], toDate: dateStrings[1] }, () => onSubmit(this.state))}
          />
        </Col>
      </Row>
    );
  }
}
