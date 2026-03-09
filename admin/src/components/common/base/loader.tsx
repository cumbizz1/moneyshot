/* eslint-disable react/prop-types */
import './loader.module.less';

import classNames from 'classnames';
import React from 'react';

function Loader({ spinning = false, fullScreen = false }) {
  return (
    <div
      className={classNames('loader', {
        hidden: !spinning,
        fullScreen
      })}
    >
      <div className="warpper">
        <div className="inner" />
        <div className="text">LOADING</div>
      </div>
    </div>
  );
}

export default Loader;
