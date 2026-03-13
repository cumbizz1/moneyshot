/* eslint-disable react/require-default-props */
import { BarsOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';

interface IProps {
  onMenuClick: any,
  menuOptions?: any[],
  buttonStyle?: any,
  dropdownProps?: any
}

export function DropOption({
  onMenuClick, menuOptions = [], buttonStyle, dropdownProps
}: IProps) {
  const menu = menuOptions.map((item) => (
    <Menu.Item key={item.key}>{item.name}</Menu.Item>
  ));
  return (
    <Dropdown
      overlay={<Menu onSelect={onMenuClick}>{menu}</Menu>}
      {...dropdownProps}
    >
      <Button style={{ border: 'none', ...buttonStyle }}>
        <BarsOutlined style={{ marginRight: 2 }} />
        <DownOutlined />
      </Button>
    </Dropdown>
  );
}
