import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import { PureComponent } from 'react';

interface IMenuOption {
  key: string;
  name: string;
  onClick?: Function;
  children?: any;
}

interface IProps {
  // eslint-disable-next-line react/require-default-props
  menuOptions?: IMenuOption[];
  // eslint-disable-next-line react/require-default-props
  buttonStyle?: any;
  // eslint-disable-next-line react/require-default-props
  dropdownProps?: any;
  // eslint-disable-next-line react/require-default-props
  nameButtonMain?: string;
}

export class DropdownAction extends PureComponent<IProps> {
  render() {
    const {
      menuOptions = [],
      buttonStyle,
      dropdownProps,
      nameButtonMain
    } = this.props;
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
}
