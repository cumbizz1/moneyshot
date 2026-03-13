import { PureComponent } from 'react';
import { IProduct } from 'src/interfaces';

interface IProps {
  // eslint-disable-next-line react/require-default-props
  product?: IProduct;
  // eslint-disable-next-line react/require-default-props
  style?: Record<string, string>;
}

export class ImageProduct extends PureComponent<IProps> {
  render() {
    const { product, style } = this.props;
    const { images } = product;
    const url = (images[0]?.thumbnails && images[0]?.thumbnails[0]) || images[0]?.url || '/empty_product.svg';
    return <img alt="" src={url} style={style || { width: 50 }} />;
  }
}
