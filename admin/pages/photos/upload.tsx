import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { FormUploadPhoto } from '@components/photo/form-upload-photo';
import { photoService } from '@services/photo.service';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

interface IProps { }

class UploadPhoto extends PureComponent<IProps> {
  state = {
    uploading: false,
    uploadPercentage: 0
  };

  _photo: File;

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file) {
    this._photo = file;
    return false;
  }

  async submit(data: any) {
    await this.setState({
      uploading: true
    });
    if (data.isFtpUpload) {
      if (!data.photoFileName) {
        message.error('Please select photo!');
        return;
      }
      try {
        await photoService.ftpUpload({ ...data, target: 'gallery' });
        message.success('Photo has been uploaded');
        Router.push('/gallery');
      } catch (error) {
        message.error('An error occurred, please try again!');
        this.setState({ uploading: false });
      }
    } else {
      if (!this._photo) {
        message.error('Please select photo!');
        return;
      }
      try {
        await photoService.uploadPhoto(this._photo, { ...data, target: 'gallery' }, this.onUploading.bind(this));
        message.success('Photo has been uploaded');
        Router.push('/gallery');
      } catch (error) {
        message.error('An error occurred, please try again!');
        this.setState({ uploading: false });
      }
    }
  }

  render() {
    const { uploading, uploadPercentage } = this.state;
    return (
      <>
        <Head>
          <title>Upload photo</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Photos', href: '/photos' }, { title: 'Upload photo' }]} />
        <Page>
          <FormUploadPhoto
            submit={this.submit.bind(this)}
            beforeUpload={this.beforeUpload.bind(this)}
            uploading={uploading}
            uploadPercentage={uploadPercentage}
          />
        </Page>
      </>
    );
  }
}

export default UploadPhoto;
