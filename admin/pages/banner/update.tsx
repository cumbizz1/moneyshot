import { FormUploadBanner } from '@components/banner/form-upload-banner';
import { BreadcrumbComponent } from '@components/common';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { bannerService } from '@services/banner.service';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { IBanner } from 'src/interfaces';

interface IProps {
  id: string;
}
class BannerUpdate extends PureComponent<IProps> {
  state = {
    submiting: false,
    fetching: true,
    banner: {} as IBanner
  };

  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  async componentDidMount() {
    const { id } = this.props;
    try {
      const resp = await bannerService.findById(id);
      this.setState({ banner: resp.data });
    } catch (e) {
      message.error('No data found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    const { id } = this.props;
    try {
      await this.setState({ submiting: true });
      const submitData = {
        ...data
      };
      await bannerService.update(id, submitData);
      message.success('Updated successfully');
      Router.push('/banner');
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { banner, submiting, fetching } = this.state;
    return (
      <>
        <Head>
          <title>Update Banner</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Banners', href: '/banner' },
            { title: banner.title ? banner.title : 'Banner Details' },
            { title: 'Update' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <FormUploadBanner banner={banner} submit={this.submit.bind(this)} uploading={submiting} />
          )}
        </Page>
      </>
    );
  }
}

export default BannerUpdate;
