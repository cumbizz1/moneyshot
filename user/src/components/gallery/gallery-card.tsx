import '@components/video/video.module.less';

import {
  CameraOutlined,
  EyeOutlined,
  HeartOutlined,
  LikeOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { shortenLargeNumber } from '@lib/number';
import Link from 'next/link';
import React from 'react';
import { IGallery } from 'src/interfaces';

import style from './gallery-card.module.less';

interface GalleryCardIProps {
  gallery: IGallery;
  currencySymbol: string;
}

function GalleryCard({ gallery, currencySymbol }: GalleryCardIProps) {
  const thumbUrl = (gallery?.coverPhoto?.thumbnails && gallery?.coverPhoto?.thumbnails[0]) || '/no-image.jpg';

  return (
    <Link
      href={{ pathname: '/gallery/[id]', query: { id: gallery?.slug || gallery?._id } }}
      as={`/gallery/${gallery?.slug || gallery?._id}`}
    >
      <div className={style['gallery-card']} style={{ backgroundImage: `url(${thumbUrl})` }}>
        {gallery?.isSale && gallery?.price > 0 && (
          <span className="gallery-price">
            <div className="label-price">
              {currencySymbol}
              {(gallery?.price || 0).toFixed(2)}
            </div>
          </span>
        )}
        <span className="play-ico"><CameraOutlined /></span>
        <div className="gallery-stats">
          <span>
            <a>
              <EyeOutlined />
              {' '}
              {shortenLargeNumber(gallery?.stats?.views || 0)}
            </a>
            &nbsp;
            <a>
              <LikeOutlined />
              {' '}
              {shortenLargeNumber(gallery?.stats?.likes || 0)}
            </a>
            &nbsp;
            <a>
              <HeartOutlined />
              {' '}
              {shortenLargeNumber(gallery?.stats?.favourites || 0)}
            </a>
          </span>
          <span>
            <a>
              <PictureOutlined />
              {' '}
              {gallery?.numOfItems || 0}
            </a>
          </span>
        </div>
        <div className="gallery-info">
          <a>{gallery?.name || 'N/A'}</a>
        </div>
      </div>
    </Link>
  );
}
export default GalleryCard;
