import { IPhoto } from 'src/interfaces';

interface IProps {
  photo: IPhoto;
  style?: Record<string, string>;
}

export function ThumbnailPhoto({
  style, photo
}: IProps) {
  const { photo: item } = photo;
  const urlThumb = (item?.thumbnails && item?.thumbnails[0]) || '/camera.png';
  return <img src={urlThumb} style={style || { width: 50 }} alt="thumb" />;
}

ThumbnailPhoto.defaultProps = {
  style: null
};

export default ThumbnailPhoto;
