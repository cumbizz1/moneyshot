import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';

interface IProps {
  onMenuClick: any;
  // eslint-disable-next-line react/require-default-props
  menuOptions?: any[];
  // eslint-disable-next-line react/require-default-props
  buttonStyle?: any;
  // eslint-disable-next-line react/require-default-props
  dropdownProps?: any;
}

export function DropOption({
  onMenuClick,
  menuOptions = [],
  buttonStyle,
  dropdownProps
}: IProps) {
  const menu = menuOptions.map((item) => (
    <Menu.Item key={item.key}>{item.name}</Menu.Item>
  ));
  return (
    <Dropdown
      overlay={<Menu onClick={onMenuClick}>{menu}</Menu>}
      {...dropdownProps}
    >
      <Button style={{ border: 'none', ...buttonStyle }}>
        Sort
        <DownOutlined />
      </Button>
    </Dropdown>
  );
}
