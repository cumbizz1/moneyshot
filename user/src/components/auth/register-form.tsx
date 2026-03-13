import { ISubscriptionPackage } from '@interfaces/subscription';
import {
  Button, Checkbox, Form, Input, message
} from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';

import style from './register-form.module.less';

interface IProps {
  submiting: boolean;
  onFinish: Function;
  selectedPackage: ISubscriptionPackage;
  acceptanceSignup: {
    content: string;
    title: string;
    image: any;
    slug: string;
  }
}

export class RegisterForm extends PureComponent<IProps> {
  state = {
    checked: false
  };

  render() {
    const {
      submiting, onFinish, selectedPackage, acceptanceSignup
    } = this.props;
    const { checked } = this.state;
    return (
      <Form
        className={style['form-message']}
        name="member_register"
        scrollToFirstError
        onFinish={(data) => {
          if (!checked) {
            return message.error('Please check acceptance box!');
          }
          return onFinish(data);
        }}
      >
        <Form.Item
          name="email"
          validateTrigger={['onChange', 'onBlur']}
          hasFeedback
          rules={[
            {
              type: 'email',
              message: 'Invalid email address!'
            },
            {
              required: true,
              message: 'Please input your email address!'
            }
          ]}
        >
          <Input placeholder="Email address" />
        </Form.Item>
        <Form.Item
          name="username"
          validateTrigger={['onChange', 'onBlur']}
          rules={[
            { required: true, message: 'Please input your username!' },
            {
              pattern: /^[a-z0-9]+$/g,
              message:
                'Username must contain lowercase alphanumerics only'
            },
            { min: 3, message: 'Username must containt at least 3 characters' }
          ]}
          hasFeedback
        >
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="name"
          validateTrigger={['onChange', 'onBlur']}
          rules={[
            { required: true, message: 'Please input your display name!' },
            {
              pattern: /^(?=.*\S).+$/g,
              message: 'Display name can not contain only whitespace'
            },
            {
              min: 3,
              message: 'Display name must containt at least 3 characters'
            }
          ]}
          hasFeedback
        >
          <Input placeholder="Display name" />
        </Form.Item>
        <Form.Item
          name="password"
          validateTrigger={['onChange', 'onBlur']}
          hasFeedback
          rules={[
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g,
              message: 'Password must have minimum 8 characters, at least 1 number, 1 uppercase letter, 1 lowercase letter & 1 special character'
            },
            { required: true, message: 'Please input your password!' }
          ]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        {acceptanceSignup && (
          <p style={{ padding: '0 5px' }}>
            <Checkbox onChange={(e) => this.setState({ checked: e.target.checked })} style={{ color: 'white' }}><a rel="noreferrer" href={`/page/${acceptanceSignup.slug || 'acceptance-signup'}`} target="_blank">{acceptanceSignup.title}</a></Checkbox>
          </p>
        )}
        <Form.Item className="text-center">
          <Button
            htmlType="submit"
            className="login-form-button"
            disabled={submiting}
            loading={submiting}
          >
            {!selectedPackage ? 'Create your account' : `Create your ${selectedPackage.name} membership account`}
          </Button>
          <p className="white-color">
            Have an account already?
            {' '}
            <Link href="/auth/login"><a>Login here</a></Link>
          </p>
        </Form.Item>
      </Form>
    );
  }
}
