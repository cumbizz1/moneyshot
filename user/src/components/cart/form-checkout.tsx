import {
  CodeOutlined,
  EnvironmentOutlined, PhoneOutlined, TagOutlined
} from '@ant-design/icons';
import { ICoupon } from '@interfaces/payment';
import { IProduct } from '@interfaces/product';
import {
  Button, Col, Form, Input, Row, Space
} from 'antd';
import { PureComponent } from 'react';

import style from './from-card.module.less';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

interface IProps {
  onFinish: Function;
  submiting: boolean;
  products: IProduct[];
  coupon: ICoupon;
  isApplyCoupon: boolean;
  onApplyCoupon: Function;
  currencySymbol: string;
  currency: string;
}

const calTotal = (items, couponValue?: number) => {
  let total = 0;
  items?.length
    && items.forEach((item) => {
      total += (item.quantity || 1) * item.price;
    });
  if (couponValue) {
    total -= total * couponValue;
  }
  return total.toFixed(2) || 0;
};

export class CheckOutForm extends PureComponent<IProps> {
  state = {
    couponCode: ''
  };

  render() {
    const {
      onFinish, submiting, products, coupon, isApplyCoupon, onApplyCoupon, currencySymbol, currency
    } = this.props;
    const { couponCode } = this.state;
    let valid = true;
    products.forEach((p) => { if (p.type === 'physical') valid = false; });
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish.bind(this)}
        initialValues={{
          deliveryAddress: '',
          phoneNumber: '',
          postalCode: ''
        }}
        labelAlign="left"
        className="account-form"
      >
        <Row
          className={style['cart-form']}
        >
          {!valid && (
            <>
              <Col span={12}>
                <Form.Item
                  label={(
                    <>
                      <EnvironmentOutlined />
                      &nbsp;
                      Delivery address
                    </>
                  )}
                  name="deliveryAddress"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Please provide your delivery address' }
                  ]}
                >
                  <Input placeholder="Enter delivery address here" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={(
                    <>
                      <PhoneOutlined />
                      &nbsp;
                      Phone number
                    </>
                  )}
                  name="phoneNumber"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Please provide your phone number' },
                    {
                      pattern: /^([+]\d{2,4})?\d{9,12}$/g, message: 'Please provide valid digit numbers'
                    }
                  ]}
                >
                  <Input
                    placeholder="Enter valid phone number (+910123456789)"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={(
                    <>
                      <TagOutlined />
                      &nbsp;
                      Postal code
                    </>
                  )}
                  name="postalCode"
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Please provide your postal code' },
                    {
                      pattern: /^\d{2,10}$/g, message: 'Please provide valid digit numbers'
                    }
                  ]}
                >
                  <Input
                    placeholder="Enter postal code here"
                  />
                </Form.Item>
              </Col>
            </>
          )}
          <Col span={valid ? 24 : 12}>
            <Form.Item
              name="couponCode"
              label={(
                <>
                  <CodeOutlined />
                  &nbsp;
                  Coupon
                </>
              )}
            >
              <Input
                onChange={(e) => this.setState({ couponCode: e.target.value })}
                placeholder="Enter coupon code here"
                disabled={isApplyCoupon}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <strong style={{ fontSize: '20px' }}>
              Total price
              {' '}
              {currency}
            </strong>
            :
            {' '}
            <Space>
              <span className={isApplyCoupon ? 'discount-price' : 'initialPrice'}>
                {currencySymbol}
                {calTotal(products)}
              </span>
              {isApplyCoupon && coupon && (
                <span>
                  {currencySymbol}
                  {calTotal(products, coupon.value)}
                </span>
              )}
            </Space>
          </Col>
          <Col span={24}>
            <Space>
              {!isApplyCoupon ? (
                <Button
                  disabled={!couponCode || submiting}
                  loading={submiting}
                  className="secondary"
                  onClick={() => onApplyCoupon(couponCode)}
                >
                  <strong>Apply coupon</strong>
                </Button>
              ) : (
                <Button
                  className="secondary"
                  onClick={() => onApplyCoupon(couponCode)}
                  disabled={submiting}
                >
                  <strong>Use later</strong>
                </Button>
              )}
              <Button
                className="primary"
                htmlType="submit"
                disabled={submiting}
                loading={submiting}
              >
                <strong>CHECK OUT</strong>
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    );
  }
}
