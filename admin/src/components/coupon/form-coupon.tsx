import {
  Button, DatePicker, Form, Input, InputNumber, TimePicker
} from 'antd';
import moment from 'moment-timezone';
import { PureComponent } from 'react';
import TimezoneSelect from 'react-timezone-select';
import { ICoupon } from 'src/interfaces';

interface IProps {
  // eslint-disable-next-line react/require-default-props
  coupon?: ICoupon;
  onFinish: Function;
  submiting: boolean;
}

function disabledDate(current) {
  return current && current < moment().startOf('day');
}

export class FormCoupon extends PureComponent<IProps> {
  state = {
    selectedDate: moment(),
    selectedTime: moment(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  componentDidMount() {
    const { coupon } = this.props;
    if (coupon) {
      this.setState({
        selectedDate: moment(coupon.expiredDate),
        selectedTime: moment(coupon.expiredDate),
        timezone: coupon?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  }

  render() {
    const { coupon, onFinish, submiting } = this.props;
    const { timezone, selectedDate, selectedTime } = this.state;
    const dateTime = selectedDate?.set({
      hour: selectedTime.get('hour'),
      minute: selectedTime.get('minute'),
      second: selectedTime.get('second')
    });
    const expiredDate = dateTime?.tz(timezone);
    return (
      <Form
        onFinish={(values) => {
          const data = values;
          data.timezone = timezone;
          data.expiredDate = expiredDate;
          onFinish(data);
        }}
        initialValues={
          coupon
            ? { ...coupon }
            : ({
              name: '',
              description: '',
              code: '',
              value: 0.1,
              status: 'active',
              numberOfUses: 99
            })
        }
        layout="vertical"
      >
        <Form.Item name="name" rules={[{ required: true, message: 'Please input name of coupon!' }]} label="Name">
          <Input placeholder="Enter coupon name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Please input code of coupon!' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="value"
          label="Discount percentage 0.01-0.99 (1% to 99%)"
          rules={[
            { required: true, message: 'Please input discount percentage' }
          ]}
        >
          <InputNumber min={0.01} max={0.99} />
        </Form.Item>
        <Form.Item
          name="numberOfUses"
          label="Number of people who can use the coupon"
          rules={[{ required: true, message: 'Please input number of uses ' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          label="Expiry Date"
        >
          <DatePicker style={{ height: 40, marginRight: 5, borderRadius: 5 }} value={selectedDate as any} format="YYYY-MM-DD" onChange={(val) => this.setState({ selectedDate: val })} disabledDate={disabledDate} />
          <TimePicker format="HH:mm" style={{ height: 40, borderRadius: 5 }} value={selectedTime as any} onChange={(val) => this.setState({ selectedTime: val })} />
          <TimezoneSelect
            value={timezone}
            onChange={(val) => this.setState({ timezone: val.value })}
          />
          <h4 style={{ color: 'red' }}>{expiredDate?.format('LLLL z')}</h4>
        </Form.Item>
        {/* <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status!' }]}>
          <Select>
            <Select.Option key="active" value="active">
              Active
            </Select.Option>
            <Select.Option key="inactive" value="inactive">
              Inactive
            </Select.Option>
          </Select>
        </Form.Item> */}
        <Form.Item className="text-center">
          <Button type="primary" htmlType="submit" disabled={submiting} loading={submiting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
