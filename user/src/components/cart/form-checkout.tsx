import {
  CodeOutlined,
  EnvironmentOutlined, PhoneOutlined, TagOutlined
} from '@ant-design/icons';
import CuroMethodSelect from '@components/payment/curo-method-select';
import { ICoupon } from '@interfaces/payment';
import { IProduct } from '@interfaces/product';
import {
  Button, Col, Form, Input, Radio, Row, Space
} from 'antd';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

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
  curoEnabled: boolean;
  ccbillEnabled: boolean;
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

class CheckOutForm extends PureComponent<IProps, any> {
  constructor(props) {
    super(props);

    const { ccbillEnabled, curoEnabled } = props;
    let paymentGateway = '';
    if (ccbillEnabled) paymentGateway = 'ccbill';
    else if (curoEnabled) paymentGateway = 'curo';
    this.state = {
      couponCode: '',
      curoMethod: 'creditcard',
      paymentGateway
    };
  }

  render() {
    const {
      onFinish, submiting, products, coupon, isApplyCoupon, onApplyCoupon, currencySymbol, currency,
      curoEnabled,
      ccbillEnabled
    } = this.props;
    const { couponCode, paymentGateway, curoMethod } = this.state;
    let valid = true;
    products.forEach((p) => { if (p.type === 'physical') valid = false; });
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(values) => {
          onFinish({
            ...values,
            paymentGateway,
            curoMethod
          })
        }}
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
            <Radio.Group onChange={(e) => this.setState({ paymentGateway: e.target.value })} value={paymentGateway}>
              {ccbillEnabled && (
                <Radio value="ccbill">
                  <img alt="CCBill" src="/ccbill-ico.png" style={{width: '50px', height: 'auto'}} />
                </Radio>
              )}
              {curoEnabled && (
                <Radio value="curo">
                  <img alt="CURO" src="/curo-icon.jpg" style={{width: '50px', height: 'auto'}} />
                </Radio>
              )}
            </Radio.Group>
            {paymentGateway === 'curo' && <>
              <hr />
              <CuroMethodSelect
                method={curoMethod}
                onChange={(method) => this.setState({ curoMethod: method })}
              />
            </>}
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

const mapStates = (state: any) => {
  return {
    ccbillEnabled: state.settings.ccbillEnable,
    curoEnabled: state.settings.curoEnabled
  };
};

export default connect(mapStates)(CheckOutForm);
