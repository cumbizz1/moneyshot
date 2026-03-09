import { BreadcrumbComponent } from '@components/common';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { FormCoupon } from '@components/coupon/form-coupon';
import { couponService } from '@services/coupon.service';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

interface IProps {
  id: string;
}
class CouponUpdate extends PureComponent<IProps> {
  state = {
    submiting: false,
    fetching: true,
    coupon: null
  };

  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  async componentDidMount() {
    const { id } = this.props;
    try {
      const resp = await couponService.findByIdOrCode(id);
      this.setState({ coupon: resp.data });
    } catch (e) {
      message.error('Coupon not found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    const { id } = this.props;
    try {
      this.setState({ submiting: true });

      const submitData = {
        ...data
      };
      await couponService.update(id, submitData);
      message.success('Updated successfully');
      Router.push('/coupon');
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { coupon, submiting, fetching } = this.state;
    return (
      <>
        <Head>
          <title>Update Coupon</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Coupon', href: '/coupon' }, { title: coupon?.name || 'Edit coupon' }]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <FormCoupon coupon={coupon} onFinish={this.submit.bind(this)} submiting={submiting} />
          )}
        </Page>
      </>
    );
  }
}

export default CouponUpdate;
