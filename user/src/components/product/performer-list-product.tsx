import { Col, Row } from 'antd';
import { PureComponent } from 'react';

import { IProduct } from '../../interfaces/product';
import ProductCard from './product-card';

interface IProps {
  products: IProduct[];
  currencySymbol: string;
}

export class PerformerListProduct extends PureComponent<IProps> {
  render() {
    const { products, currencySymbol } = this.props;
    return (
      <Row>
        {products.length > 0
          && products.map((product: IProduct) => (
            <Col xs={12} sm={12} md={6} lg={6} key={product._id}>
              <ProductCard product={product} currencySymbol={currencySymbol} />
            </Col>
          ))}
      </Row>
    );
  }
}
