import {
  Button, Checkbox, Form, Input, InputNumber, Select
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { createRef, PureComponent } from 'react';
import { ISubscriptionPackage, ISubscriptionPackageCreate } from 'src/interfaces';

interface IProps {
  // eslint-disable-next-line react/require-default-props
  subscriptionPackage?: Partial<ISubscriptionPackage>;
  onFinish: Function;
  // eslint-disable-next-line react/require-default-props
  submiting?: boolean;
}

export class FormSubscriptionPackage extends PureComponent<IProps> {
  state = {
    isRecurring: false
  };

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    const { subscriptionPackage } = this.props;
    if (subscriptionPackage && subscriptionPackage.type === 'recurring') {
      this.setState({ isRecurring: true });
    }
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
    if (field === 'type') {
      this.setState({ isRecurring: val === 'recurring' });
    }
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      subscriptionPackage, onFinish, submiting
    } = this.props;
    const { isRecurring } = this.state;
    return (
      <Form
        ref={this.formRef}
        onFinish={onFinish.bind(this)}
        initialValues={
          subscriptionPackage || ({
            name: '',
            price: 0,
            isActive: true,
            ordering: 0,
            description: '',
            recurringPrice: 0,
            recurringPeriod: 0,
            type: 'single'
          } as ISubscriptionPackageCreate)
        }
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input name!' }]}
          label="Name"
        >
          <Input placeholder="Enter package's name" />
        </Form.Item>
        <Form.Item
          name="price"
          label="Initial Price"
          rules={[{ required: true, message: 'Please input initial price!' }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          name="initialPeriod"
          label="Initial Period (in days)"
          rules={[{ required: true, message: 'Please input day of period!' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Please select type!' }]}
        >
          <Select onChange={(val) => this.setFormVal('type', val)}>
            <Select.Option key="single" value="single">
              Single
            </Select.Option>
            <Select.Option key="recurring" value="recurring">
              Recurring
            </Select.Option>
          </Select>
        </Form.Item>
        {isRecurring && (
          <div>
            <Form.Item
              name="recurringPrice"
              label="Recurring Price"
              rules={[{ required: true, message: 'Please input price!' }]}
            >
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item
              name="recurringPeriod"
              label="Recurring Period (in days)"
              rules={[{ required: true, message: 'Please input recurring period!' }]}
            >
              <InputNumber min={1} />
            </Form.Item>
          </div>
        )}
        <Form.Item name="ordering" label="Ordering">
          <InputNumber />
        </Form.Item>
        <Form.Item name="isActive" valuePropName="checked" label="Active?">
          <Checkbox />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={submiting}
            disabled={submiting}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
