/* eslint-disable react/require-default-props */
import { AvatarUpload } from '@components/user/avatar-upload';
import { getGlobalConfig } from '@services/config';
import {
  Button, Col,
  Form, Input, Row, Select, Switch
} from 'antd';
import { PureComponent } from 'react';
import { ICountry, IUser } from 'src/interfaces';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  onFinish: Function;
  user?: IUser;
  updating?: boolean;
  options?: {
    uploadHeaders?: any;
    avatarUploadUrl?: string;
    onAvatarUploaded?: Function;
    beforeUpload?: Function;
  };
  countries: ICountry[];
}

export class AccountForm extends PureComponent<IProps> {
  render() {
    const {
      onFinish, user, updating, options, countries
    } = this.props;
    const {
      uploadHeaders, avatarUploadUrl, onAvatarUploaded, beforeUpload
    } = options;
    const config = getGlobalConfig();
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish.bind(this)}
        initialValues={
          user || {
            status: 'active',
            gender: 'male',
            roles: ['user']
          }
        }
      >
        <Row>
          <Col xs={12} md={12}>
            <Form.Item
              name="name"
              label="Display name"
              rules={[
                { required: true }, {
                  pattern: /^(?=.*\S).+$/g,
                  message: 'Display name can not contain only whitespace'
                }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Username is required' }, {
                pattern: /^[a-z0-9]+$/g,
                message: 'Username must contain only alphanumeric characters'
              }, { min: 3, message: 'Username must contain at least 3 characters' }]}
            >
              <Input placeholder="Unique, lowercase alphanumeric characters" />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Invalid email address' }, { required: true, message: 'Email address is required' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item name="roles" label="Roles" rules={[{ required: true, message: 'Please select a role' }]}>
              <Select mode="multiple">
                <Select.Option key="user" value="user">
                  User
                </Select.Option>
                <Select.Option key="admin" value="admin">
                  Admin
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          {!user && (
          <>
            <Col md={12} xs={24}>
              <Form.Item
                label="Password"
                name="password"
                validateTrigger={['onChange', 'onBlur']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Please enter password'
                  },
                  {
                    min: 6,
                    message: 'Password must have minimum 6 characters'
                  }
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                validateTrigger={['onChange', 'onBlur']}
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Please confirm password'
                  },
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      // eslint-disable-next-line prefer-promise-reject-errors
                      return Promise.reject('Confirm password does not match!');
                    }
                  })
                ]}
              >
                <Input.Password placeholder="Confirm password" />
              </Form.Item>
            </Col>
          </>
          )}
          <Col md={12} xs={12}>
            <Form.Item name="firstName" label="Family name">
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item name="lastName" label="Given name">
              <Input />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item name="gender" label="Gender">
              <Select>
                <Select.Option key="male" value="male">
                  Male
                </Select.Option>
                <Select.Option key="female" value="female">
                  Female
                </Select.Option>
                <Select.Option key="transgender" value="transgender">
                  Transgender
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item name="country" label="Country">
              <Select
                showSearch
                optionFilterProp="label"
              >
                {countries.map((country) => (
                  <Select.Option key={country.code} label={country.name} value={country.code}>
                    <img src={country.flag} alt="flag" width="25px" />
                    {' '}
                    {country.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item name="status" label="Status">
              <Select>
                <Select.Option key="active" value="active">
                  Active
                </Select.Option>
                <Select.Option key="inactive" value="inactive">
                  Inactive
                </Select.Option>
                <Select.Option disabled key="pending-email-confirmation" value="pending-email-confirmation">
                  Pending email confirmation
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="verifiedEmail" label="Verified Email" valuePropName="checked">
              <Switch defaultChecked={user && user.verifiedEmail ? user.verifiedEmail : false} />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              label="Avatar"
              help={`Image must be smaller than ${config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}MB!`}
            >
              <AvatarUpload
                headers={uploadHeaders}
                uploadUrl={avatarUploadUrl}
                onUploaded={onAvatarUploaded}
                image={user ? user.avatar : ''}
                onBeforeUpload={beforeUpload}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" loading={updating}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
