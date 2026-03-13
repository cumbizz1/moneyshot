/* eslint-disable react/require-default-props */
import React from 'react';

import Loader from '../base/loader';
import style from './page.module.less';

interface IProps {
  loading?: boolean;
  children
}

export function Page({
  children, loading = false
}: IProps) {
  const loadingStyle = {
    height: 'calc(100vh - 184px)',
    overflow: 'hidden'
  };
  return (
    <div
      // className={classnames(className, {
      //   contentInner: inner
      // })}
      className={style.contentInner}
      style={loading ? loadingStyle : null}
    >
      {loading ? <Loader spinning /> : ''}
      {children}
    </div>
  );
}

export default Page;
