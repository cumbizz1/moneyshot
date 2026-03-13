import { Button, Form, Input } from 'antd';
import React from 'react';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  onFinish: Function;
  updating: boolean;
}

export function UpdatePaswordForm({ onFinish, updating = false }: IProps) {
  return (
    <Form name="nest-messages" onFinish={onFinish.bind(this)} {...layout}>
      <Form.Item
        name="password"
        label="Password"
        validateTrigger={['onChange', 'onBlur']}
        hasFeedback
        rules={[
          { required: true, message: 'Please input your password!' },
          { min: 8, message: 'Password must contain at least 8 characters' }
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
        <Button type="primary" htmlType="submit" loading={updating}>
          Update
        </Button>
      </Form.Item>
    </Form>
  );
}
