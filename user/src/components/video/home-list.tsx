import { CaretRightOutlined } from '@ant-design/icons';
import { VideoCard } from '@components/video';
import { Col, Row, Spin } from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces';

import homeListStyle from './home-list.module.less';

interface IProps {
  videos: IVideo[];
  loading: boolean;
  currencySymbol: string
}

export class HomeListVideo extends PureComponent<IProps> {
  render() {
    const { videos, loading, currencySymbol } = this.props;

    return (
      <div className={homeListStyle['video-list']}>
        <Row>
          {videos.length > 0 && videos.map((v) => (
            <Col xs={12} sm={12} md={6} lg={6} key={v._id}>
              <VideoCard video={v} currencySymbol={currencySymbol} />
            </Col>
          ))}
        </Row>
        {!loading && !videos.length && <div className="text-center" style={{ margin: '20px 0' }}>No video was found</div>}
        {loading && <div className="text-center"><Spin /></div>}
        {videos && videos.length > 8 && (
          <div className="show-all">
            <Link href={{ pathname: 'video' }} as="/video">
              <a>
                SEE ALL VIDEOS
                <CaretRightOutlined />
              </a>
            </Link>
          </div>
        )}
      </div>
    );
  }
}
