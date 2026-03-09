/* eslint-disable react/require-default-props */
import { Carousel } from 'antd';
import { IBanner } from 'src/interfaces';

import styles from './banner.module.less';

interface IProps {
  banners?: IBanner[];
  autoplay?: boolean;
  autoplaySpeed?: number;
  arrows?: boolean;
  dots?: boolean;
  swipeToSlide?: boolean;
}

export function Banner({
  banners, autoplay = false, arrows = false, dots = false, swipeToSlide = true, autoplaySpeed = 5000
}: IProps) {
  return (
    <div className={styles.bannerCarousel}>
      <Carousel
        autoplay={autoplay}
        swipeToSlide={swipeToSlide}
        arrows={arrows}
        dots={dots}
        autoplaySpeed={autoplaySpeed}
      >
        {banners.map((item) => (
          <a key={item._id} href={item.link} target="_blank" rel="noreferrer">
            <img src={item.photo && item.photo.url} alt="" key={item._id} />
          </a>
        ))}
      </Carousel>
    </div>
  );
}
