import { BreadcrumbComponent } from '@components/common';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { FormGallery } from '@components/gallery/form-gallery';
import { galleryService } from '@services/gallery.service';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { IGallery } from 'src/interfaces';

interface IProps {
  id: string;
}

class GalleryUpdate extends PureComponent<IProps> {
  state = {
    submiting: false,
    fetching: true,
    gallery: {} as IGallery
  };

  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  async componentDidMount() {
    const { id } = this.props;
    try {
      const resp = await galleryService.findById(id);
      this.setState({ gallery: resp.data });
    } catch (e) {
      message.error('Gallery not found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    const { id } = this.props;
    try {
      if (!data.performerIds || !data.performerIds.length) {
        message.error('Please select a performer');
        return;
      }
      await this.setState({ submiting: true });
      const submitData = {
        ...data
      };
      if (!submitData.categoryIds || !submitData.categoryIds.length) delete submitData.categoryIds;
      if (!submitData.performerIds || !submitData.performerIds.length) delete submitData.performerIds;
      if (!submitData.tags || !submitData.tags.length) delete submitData.tags;
      await galleryService.update(id, submitData);
      message.success('Updated successfully');
      Router.push('/gallery');
    } catch (e) {
      message.error('Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { gallery, submiting, fetching } = this.state;
    return (
      <>
        <Head>
          <title>Update Gallery</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Gallery', href: '/gallery' },
            { title: gallery.name ? gallery.name : 'Detail gallery' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <FormGallery
              gallery={gallery}
              onFinish={this.submit.bind(this)}
              submiting={submiting}
            />
          )}
        </Page>
      </>
    );
  }
}

export default GalleryUpdate;
