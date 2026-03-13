import {
  AreaChartOutlined, BarChartOutlined,
  DollarOutlined,
  DotChartOutlined, LineChartOutlined, PieChartOutlined
} from '@ant-design/icons';
import { utilsService } from '@services/utils.service';
import {
  Card,
  Col, Row, Statistic
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';

export default class Dashboard extends PureComponent<any> {
  state = {
    stats: {
      totalActiveUsers: 0,
      totalInactiveUsers: 0,
      totalPerformers: 0,
      totalOrders: 0,
      totalCreatedOrders: 0,
      totalRefundedOrders: 0,
      totalShippingdOrders: 0,
      totalDeliveredOrders: 0,
      totalSubscribers: 0,
      totalActiveSubscribers: 0,
      totalVideos: 0,
      totalProducts: 0,
      totalPhotos: 0,
      totalGalleries: 0,
      totalMoneyEarnings: 0
    }
  };

  async componentDidMount() {
    const stats = await (await utilsService.statistics()).data;
    if (stats) {
      this.setState({ stats });
    }
  }

  render() {
    const { stats } = this.state;
    return (
      <>
        <Head>
          <title>Dashboard</title>
        </Head>
        <Row gutter={24} className="dashboard-stats">
          <Col md={8} xs={12}>
            <Link href="/users?status=active">
              <a>
                <Card>
                  <Statistic
                    title="Active USERS"
                    value={stats.totalActiveUsers}
                    valueStyle={{ color: '#ffc107' }}
                    prefix={<LineChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/users?status=inactive">
              <a>
                <Card>
                  <Statistic
                    title="INACTIVE USERS"
                    value={stats.totalInactiveUsers}
                    valueStyle={{ color: '#ffc107' }}
                    prefix={<LineChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/performer">
              <a>
                <Card>
                  <Statistic
                    title="TOTAL PERFORMERS"
                    value={stats.totalPerformers}
                    valueStyle={{ color: '#009688' }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/gallery">
              <a>
                <Card>
                  <Statistic
                    title="GALLERIES"
                    value={stats.totalGalleries}
                    valueStyle={{ color: '#5399d0' }}
                    prefix={<PieChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/photos">
              <a>
                <Card>
                  <Statistic
                    title="PHOTOS"
                    value={stats.totalPhotos}
                    valueStyle={{ color: '#5399d0' }}
                    prefix={<PieChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/product">
              <a>
                <Card>
                  <Statistic
                    title="PRODUCTS"
                    value={stats.totalProducts}
                    valueStyle={{ color: '#5399d0' }}
                    prefix={<PieChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/video">
              <a>
                <Card>
                  <Statistic
                    title="VIDEOS"
                    value={stats.totalVideos}
                    valueStyle={{ color: '#5399d0' }}
                    prefix={<DotChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/order?deliveryStatus=created">
              <a>
                <Card>
                  <Statistic
                    title="CREATED ORDERS"
                    value={stats.totalCreatedOrders}
                    valueStyle={{ color: '#c8d841' }}
                    prefix={<AreaChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/order?deliveryStatus=shipping">
              <a>
                <Card>
                  <Statistic
                    title="SHIPPING ORDERS"
                    value={stats.totalShippingdOrders}
                    valueStyle={{ color: '#c8d841' }}
                    prefix={<AreaChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/order?deliveryStatus=delivered">
              <a>
                <Card>
                  <Statistic
                    title="DELIVERED ORDERS"
                    value={stats.totalDeliveredOrders}
                    valueStyle={{ color: '#c8d841' }}
                    prefix={<AreaChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/order?deliveryStatus=refunded">
              <a>
                <Card>
                  <Statistic
                    title="REFUNDED ORDERS"
                    value={stats.totalRefundedOrders}
                    valueStyle={{ color: '#c8d841' }}
                    prefix={<AreaChartOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
          <Col md={8} xs={12}>
            <Link href="/payment-history">
              <a>
                <Card>
                  <Statistic
                    title="TOTAL EARNED"
                    value={stats.totalMoneyEarnings}
                    valueStyle={{ color: 'red' }}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </a>
            </Link>
          </Col>
        </Row>
      </>
    );
  }
}
