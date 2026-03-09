import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { FormGallery } from '@components/gallery/form-gallery';
import { galleryService } from '@services/gallery.service';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

class GalleryCreate extends PureComponent {
  state = {
    submiting: false
  };

  async submit(data: any) {
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
      const resp = await galleryService.create(submitData);
      message.success('Created successfully');
      Router.replace(`/gallery/update?id=${resp.data._id}`);
    } catch (e) {
      message.error('Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { submiting } = this.state;
    return (
      <>
        <Head>
          <title>New gallery</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Galleries', href: '/gallery' }, { title: 'New gallery' }]}
        />
        <Page>
          <FormGallery onFinish={this.submit.bind(this)} submiting={submiting} />
        </Page>
      </>
    );
  }
}

export default GalleryCreate;
