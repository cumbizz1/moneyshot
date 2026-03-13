import { Pagination } from 'antd';
import { PureComponent } from 'react';

interface IProps {
  showQuickJumper: boolean;
  defaultCurrent: number;
  total: number;
  pageSize: number;
  onChange: Function;
  showSizeChanger: boolean;
}

export class ProPagination extends PureComponent<IProps> {
  handleChange = (page: number) => {
    const { onChange } = this.props;
    onChange && onChange(page);
  };

  render() {
    const {
      showQuickJumper, defaultCurrent, total, pageSize, showSizeChanger
    } = this.props;
    return (
      <div>
        <Pagination
          showQuickJumper={showQuickJumper}
          defaultCurrent={defaultCurrent}
          total={total}
          pageSize={pageSize}
          onChange={this.handleChange}
          showSizeChanger={showSizeChanger}
        />
      </div>
    );
  }
}
