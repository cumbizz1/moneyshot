import { AvatarUpload } from '@components/user/avatar-upload';
import {
  Button, Col, Form, Input, Row,
  Select
} from 'antd';
import React from 'react';
import { IUser, IUserFormData } from 'src/interfaces';

import style from './user-account-from.module.less';

interface UserAccountFormIProps {
  user: IUser;
  updating: boolean;
  onFinish(data: IUserFormData): Function;
  options?: {
    uploadHeader: any;
    avatarUrl: string;
    uploadAvatar(): Function;
  };
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

export function UserAccountForm({
  updating,
  onFinish,
  user,
  options
}: UserAccountFormIProps) {
  return (
    <Form
      className={style['account-form']}
      {...layout}
      name="user-account-form"
      onFinish={onFinish}
      initialValues={user}
      scrollToFirstError
    >
      <Row>
        <Col xs={24} sm={12}>
          <Form.Item
            name="firstName"
            label="Family name"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your first name!' },
              {
                pattern:
                  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                message: 'Family name can not contain number and special character'
              }
            ]}
          >
            <Input placeholder="First Name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Given name"
            validateTrigger={['onChange', 'onBlur']}
            rules={[
              { required: true, message: 'Please input your last name!' },
              {
                pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                message: 'Given name can not contain number and special character'
              }
            ]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>
          <Form.Item name="username" label="Username" required>
            <Input disabled placeholder="username" />
          </Form.Item>
          <Form.Item
            label="Email address"
            name="email"
            rules={[{ type: 'email', required: true }]}
          >
            <Input disabled placeholder="Email Address" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Display name"
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
          >
            <Input placeholder="Display name" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[
              { required: true, message: 'Please select your gender' }
            ]}
          >
            <Select>
              <Select.Option value="male" key="male">
                Male
              </Select.Option>
              <Select.Option value="female" key="female">
                Female
              </Select.Option>
              <Select.Option value="transgender" key="transgender">
                Transgender
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Avatar" required>
            <AvatarUpload
              image={user.avatar}
              uploadUrl={options.avatarUrl}
              headers={options.uploadHeader}
              onUploaded={options.uploadAvatar}
            />
            <div className="ant-form-item-explain" style={{ textAlign: 'left' }}><div role="alert">Avatar is at 5Mb or below</div></div>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
        <Button htmlType="submit" className="primary" loading={updating}>
          Update Profile
        </Button>
      </Form.Item>
    </Form>
  );
}

UserAccountForm.defaultProps = {
  options: {
    uploadHeader: '',
    avatarUrl: ''
  }
};
