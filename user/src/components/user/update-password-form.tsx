import {
  Button, Col,
  Form, Input, Row
} from 'antd';

import style from './user-account-from.module.less';

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
    <Form
      name="nest-messages"
      className={style['account-form']}
      onFinish={onFinish.bind(this)}
      {...layout}
    >
      <Row>
        <Col md={12} xs={24}>
          <Form.Item
            label="Password"
            name="password"
            validateTrigger={['onChange', 'onBlur']}
            hasFeedback
            rules={[
              {
                pattern: /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[^\w\d]).*$/g,
                message: 'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character'
              },
              { required: true, message: 'Please enter your password!' }
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item
            name="confirm"
            label="Confirm Password"
            validateTrigger={['onChange', 'onBlur']}
            dependencies={['password']}
            hasFeedback
            rules={[
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return Promise.reject('Passwords do not match together!');
                }
              })
            ]}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item wrapperCol={{ offset: 4 }}>
        <Button className="primary" htmlType="submit" loading={updating}>
          Save change
        </Button>
      </Form.Item>
    </Form>
  );
}
