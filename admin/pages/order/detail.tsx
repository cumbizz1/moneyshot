import { BreadcrumbComponent } from '@components/common/breadcrumb';
import Page from '@components/common/layout/page';
import { getResponseError } from '@lib/utils';
import {
  Button, Input, Layout, message, Select, Tag
} from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IOrder, IUIConfig } from 'src/interfaces';
import { orderService } from 'src/services';

const { Content } = Layout;

interface IProps {
  id: string;
  ui: IUIConfig
}

interface IStates {
  order: IOrder;
  shippingCode: string;
  deliveryStatus: string;
}

class OrderDetailPage extends PureComponent<IProps, IStates> {
  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  state = {
    order: null,
    shippingCode: '',
    deliveryStatus: ''
  };

  componentDidMount() {
    this.getData();
  }

  async onUpdate() {
    const { deliveryStatus, shippingCode, order } = this.state;
    const { id } = this.props;
    if (order.productType === 'physical' && !shippingCode) {
      message.error('Missing shipping code');
      return;
    }
    if (order.productType === 'physical' && !shippingCode.match(/^[a-zA-Z0-9]+$/g)) {
      message.error('Invalid shipping code');
      return;
    }
    try {
      await orderService.update(id, { deliveryStatus, shippingCode });
      message.success('Changes saved.');
      Router.push('/order');
    } catch (e) {
      message.error(getResponseError(e));
    }
  }

  async getData() {
    const { id } = this.props;
    try {
      const { data: order } = await orderService.findDetailsById(id);
      await this.setState({
        order,
        shippingCode: order.shippingCode,
        deliveryStatus: order.deliveryStatus
      });
    } catch (e) {
      message.error('Can not find order!');
    }
  }

  render() {
    const { order } = this.state;
    const { ui: { currencySymbol } } = this.props;
    return (
      <Layout>
        <Head>
          <title>Order Details</title>
        </Head>
        <Content>
          <div className="main-container">
            <BreadcrumbComponent
              breadcrumbs={[
                { title: 'Orders', href: '/order' },
                {
                  title: order && order?.orderNumber ? `#${order?.orderNumber}` : 'Order Details'
                }
              ]}
            />
            <Page>
              {order && (
              <div className="main-container">
                <div style={{ marginBottom: '10px' }}>
                  <strong>Order ID</strong>
                  : #
                  {order?.orderNumber}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Product name</strong>
                  :
                  {' '}
                  {order?.name}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Product description</strong>
                  :
                  {' '}
                  {order?.description}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Product type</strong>
                  :
                  {' '}
                  <Tag color="cyan">{order?.productType}</Tag>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Buyer</strong>
                  :
                  {' '}
                  {order?.buyer?.name || `${order?.buyer?.firstName || 'N/'} ${order?.buyer?.lastName || 'A'}`}
                  {' '}
                  - @
                  {order?.buyer?.username}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Unit Price:</strong>
                  {' '}
                  {currencySymbol}
                  {order?.unitPrice}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Quantity</strong>
                  :
                  {' '}
                  {order?.quantity}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Total Price:</strong>
                  {' '}
                  {currencySymbol}
                  {order?.totalPrice}
                </div>
                {order?.productType === 'physical' && (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Delivery Address</strong>
                    :
                    {' '}
                    {order?.deliveryAddress || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Delivery Phone Number</strong>
                    :
                    {' '}
                    {order?.phoneNumber || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Delivery Postal Code</strong>
                    :
                    {' '}
                    {order?.postalCode || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Shipping Code</strong>
                    :
                    <Input placeholder="Enter shipping code here" defaultValue={order?.shippingCode} onChange={(e) => this.setState({ shippingCode: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Delivery Status</strong>
                    :
                    <Select style={{ width: '100%' }} onChange={(e) => this.setState({ deliveryStatus: e })} defaultValue={order?.deliveryStatus}>
                      <Select.Option key="created" value="created" disabled>
                        Created
                      </Select.Option>
                      <Select.Option key="failed" value="failed" disabled>
                        Failed
                      </Select.Option>
                      <Select.Option key="processing" value="processing">
                        Processing
                      </Select.Option>
                      <Select.Option key="shipping" value="shipping">
                        Shipping
                      </Select.Option>
                      <Select.Option key="delivered" value="delivered">
                        Delivered
                      </Select.Option>
                      <Select.Option key="refunded" value="refunded">
                        Refunded
                      </Select.Option>
                    </Select>
                  </div>
                </>
                )}
                <div style={{ marginBottom: '10px' }}>
                  {order?.productType === 'physical' && <Button danger onClick={this.onUpdate.bind(this)}>Update</Button>}
                  &nbsp;
                  <Button onClick={() => Router.back()}>Back</Button>
                </div>
              </div>
              )}
            </Page>
          </div>
        </Content>
      </Layout>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ui: state.ui
});

export default connect(mapStateToProps)(OrderDetailPage);
