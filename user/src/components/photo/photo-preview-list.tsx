import { Button, Image } from 'antd';
import Router from 'next/router';
import { IPhotos } from 'src/interfaces';

interface IProps {
  photos: IPhotos[];
  isBlur: boolean;
}

function PhotoPreviewList({
  photos, isBlur
}: IProps) {
  return (
    <div className={!isBlur ? 'list-photos' : 'list-photos blur'}>
      <Image.PreviewGroup>
        {photos.length > 0 && photos.map((item) => (
          <Image
            placeholder
            loading="lazy"
            key={item._id}
            className="photo-card"
            src={(item?.photo?.thumbnails && item?.photo?.thumbnails[0])}
            preview={isBlur ? false : {
              src: item?.photo?.url
            }}
          />
        ))}
      </Image.PreviewGroup>
      {isBlur && <Button className="secondary sub-btn" onClick={() => Router.push('/user/upgrade-membership')}>UPGRADE YOUR MEMBERSHIP PLAN TO VIEW FULL CONTENT</Button>}
    </div>
  );
}
export default PhotoPreviewList;
