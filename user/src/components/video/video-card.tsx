import {
  CommentOutlined, EyeFilled, HeartOutlined,
  HourglassFilled, LikeFilled, PlayCircleOutlined
} from '@ant-design/icons';
import { videoDuration } from '@lib/index';
import { shortenLargeNumber } from '@lib/number';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces';

import style from './video-card.module.less';

interface IProps {
  video: IVideo;
  currencySymbol: string;
}

export class VideoCard extends PureComponent<IProps> {
  render() {
    const { video, currencySymbol } = this.props;
    const { thumbnail, video: file, teaser } = video;
    const url = (thumbnail?.thumbnails && thumbnail?.thumbnails[0]) || thumbnail?.url || (teaser?.thumbnails && teaser?.thumbnails[0]) || (file?.thumbnails && file?.thumbnails[0]) || '/no-image.jpg';
    return (
      <Link
        href={{ pathname: '/video/[id]', query: { id: video.slug || video._id } }}
        as={`/video/${video.slug || video._id}`}
      >
        <div className={style['vid-card']} style={{ backgroundImage: `url(${url})` }}>
          <div className="vid-price">
            {video.isSchedule && video.scheduledAt && (
              <span className="label-price custom">
                Upcoming
              </span>
            )}
            {!video.isBought && video.isSale && video.price > 0 && (
              <span className="label-price">
                {currencySymbol}
                {(video.price || 0).toFixed(2)}
              </span>
            )}
          </div>
          <span className="play-ico"><PlayCircleOutlined /></span>
          <div className="vid-stats">
            <span>
              <a>
                <EyeFilled />
                {' '}
                {shortenLargeNumber(video?.stats?.views || 0)}
              </a>
              &nbsp;
              <a>
                <LikeFilled />
                {' '}
                {shortenLargeNumber(video?.stats?.likes || 0)}
              </a>
              &nbsp;
              <a>
                <HeartOutlined />
                {' '}
                {shortenLargeNumber(video?.stats?.favourites || 0)}
              </a>
              &nbsp;
              <a>
                <CommentOutlined />
                {' '}
                {shortenLargeNumber(video?.stats?.comments || 0)}
              </a>
            </span>
            <span>
              <a>
                <HourglassFilled />
                {' '}
                {videoDuration(video?.video?.duration || 0)}
              </a>
            </span>
          </div>
          <div className="vid-info">
            <a>{video.title}</a>
          </div>
        </div>
      </Link>
    );
  }
}
