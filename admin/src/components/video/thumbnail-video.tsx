import { Image } from 'antd';
import { IVideo } from 'src/interfaces';

interface IProps {
  video: IVideo;
  style?: any;
}

export function ThumbnailVideo({
  video = null,
  style = null
}: IProps) {
  const { thumbnail, video: media, teaser } = video;
  const url = (thumbnail?.thumbnails && thumbnail?.thumbnails[0]) || (teaser?.thumbnails && teaser?.thumbnails[0]) || (media?.thumbnails && media?.thumbnails[0]) || '/placeholder-image.jpg';
  return <Image src={url} style={style || { width: 150 }} />;
}

ThumbnailVideo.defaultProps = {
  style: null
};

export default ThumbnailVideo;
