import { Col, Row } from 'antd';
import { PureComponent } from 'react';

import { IVideo } from '../../interfaces/video';
import { VideoCard } from '.';

interface IProps {
  videos: any;
  currencySymbol: string
}

export class GridListVideo extends PureComponent<IProps> {
  render() {
    const { videos, currencySymbol } = this.props;
    return (
      <Row>
        {videos.length > 0
          && videos.map((video: IVideo) => {
            if (!video) return null;
            return (
              <Col xs={12} sm={12} md={6} lg={6} key={video._id}>
                <VideoCard video={video} currencySymbol={currencySymbol} />
              </Col>
            );
          })}
      </Row>
    );
  }
}
