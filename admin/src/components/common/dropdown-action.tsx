/* eslint-disable react/require-default-props */
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';

interface IMenuOption {
  key: string;
  name: string;
  onClick?: Function;
  children?: any;
}

interface IProps {
  menuOptions?: IMenuOption[];
  buttonStyle?: any;
  dropdownProps?: any;
  nameButtonMain?: string;
}

export function DropdownAction({
  menuOptions = [],
  buttonStyle,
  dropdownProps,
  nameButtonMain
}: IProps) {
  const menu = menuOptions.map((item) => (
    <Menu.Item key={item.key} onClick={() => item.onClick && item.onClick()}>
      {item.children || item.name}
    </Menu.Item>
  ));
  return (
    <Dropdown overlay={<Menu>{menu}</Menu>} {...dropdownProps}>
      <Button style={{ ...buttonStyle }}>
        {nameButtonMain || 'Action'}
        <DownOutlined />
      </Button>
    </Dropdown>
  );
}

export default DropdownAction;
