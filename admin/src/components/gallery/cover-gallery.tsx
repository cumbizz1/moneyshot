import { IGallery } from 'src/interfaces';

interface IProps {
  gallery: IGallery;
  style?: Record<string, string>;
}

export function CoverGallery({
  gallery, style
}: IProps) {
  const { coverPhoto } = gallery;
  // get thumbnails
  const url = coverPhoto?.thumbnails?.length ? coverPhoto.thumbnails[0] : '/gallery.png';
  return <img src={url} style={style || { width: 50 }} alt="style" />;
}

CoverGallery.defaultProps = {
  style: null
};

export default CoverGallery;
