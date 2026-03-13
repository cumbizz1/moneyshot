import { IGallery } from 'src/interfaces';

interface IProps {
  gallery?: IGallery;
  style?: Record<string, string>;
}

export function CoverGallery({
  gallery,
  style = null
}: IProps) {
  const { coverPhoto } = gallery;
  const url = coverPhoto?.thumbnails[0] || '/no-image.jpg';
  return (
    <img
      alt="Cover"
      src={url}
      style={style || { width: 60, borderRadius: '3px' }}
    />
  );
}

CoverGallery.defaultProps = {
  gallery: {},
  style: null
};
