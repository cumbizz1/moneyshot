/* eslint-disable no-nested-ternary */
import { Spin } from 'antd';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces';

import style from './loader.module.less';

interface IProps {
  ui: IUIConfig
}

class Loader extends PureComponent<IProps> {
  render() {
    const { ui } = this.props;
    return (
      <div className={style['loading-screen']}>
        {ui.logoUrl ? <img alt="loading-ico" src={ui.logoUrl} /> : ui.siteName ? <span>{ui.siteName}</span> : <Spin />}
      </div>
    );
  }
}
const mapStatesToProps = (state) => ({
  ui: { ...state.ui }
});
export default connect(mapStatesToProps)(Loader) as any;
