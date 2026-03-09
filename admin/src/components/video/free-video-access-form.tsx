import { userService } from '@services/user.service';
import {
  Button, Form, message, Select, Switch
} from 'antd';
import { useRef, useState } from 'react';

const { Option } = Select;

interface FreeVideoAccessFormProps {
  onFinish: Function;
  // eslint-disable-next-line react/require-default-props
  submiting?: boolean;
}

export function FreeVideoAccessForm({ onFinish, submiting = false }: FreeVideoAccessFormProps) {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (value: string) => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setSearching(true);

      timeoutRef.current = setTimeout(async () => {
        if (!value) {
          setUsers([]);
          return;
        }
        const result = await userService.search({
          q: value,
          limit: 99
        });
        setUsers(result.data.data);
      }, 300);
    } catch (error) {
      message.error('An error occurred, please try again!');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Form
      form={form}
      onFinish={onFinish.bind(this)}
      initialValues={{
        userId: undefined,
        hasFreeVideoAccess: false
      }}
      layout="vertical"
    >
      <Form.Item
        name="userId"
        label="Select User"
        rules={[{ required: true, message: 'Please select a user' }]}
      >
        <Select
          showSearch
          showArrow
          filterOption={false}
          onSearch={handleSearch}
          notFoundContent={null}
          placeholder="Search by name, username or email"
          allowClear
          loading={searching}
          style={{ width: '100%' }}
        >
          {users.map((u) => (
            <Option key={u._id} value={u._id}>
              <strong>{u.name || u.username || `${u.firstName} ${u.lastName}`}</strong>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="hasFreeVideoAccess"
        label="Free Video Access"
        valuePropName="checked"
      >
        <Switch
          checkedChildren="Enabled"
          unCheckedChildren="Disabled"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submiting}>
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );
}
