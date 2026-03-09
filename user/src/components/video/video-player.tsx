/* eslint-disable no-return-assign */
import 'node_modules/video.js/dist/video-js.css';

import { PureComponent } from 'react';
import videojs from 'video.js';

import style from './video-player.module.less';

export class VideoPlayer extends PureComponent<any> {
  videoNode: HTMLVideoElement;

  player: any;

  componentDidMount() {
    this.player = videojs(this.videoNode, this.props);
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  render() {
    return (
      <div className={style['videojs-player']}>
        <div data-vjs-player>
          <video ref={(node) => (this.videoNode = node)} className="video-js" />
        </div>
      </div>
    );
  }
}
