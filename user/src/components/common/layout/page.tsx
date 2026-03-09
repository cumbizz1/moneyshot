import { ReactNode } from 'react';

import Loader from '../base/loader';
import style from './page.module.less';

interface IProps {
  loading?: boolean;
  children: ReactNode;
}

export function Page({
  loading = false,
  children
}: IProps) {
  const loadingStyle = {
    height: 'calc(100vh - 184px)',
    overflow: 'hidden'
  };

  return (
    <div
      className={style.contentInner}
      style={loading ? loadingStyle : null}
    >
      {loading ? <Loader spinning /> : ''}
      {children}
    </div>
  );
}

Page.defaultProps = {
  loading: false
};

export default Page;
