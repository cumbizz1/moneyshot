import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { FormUploadVideo } from '@components/video/form-upload-video';
import { fileService, videoService } from '@services/index';
import { Layout, message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

interface IFiles {
  fieldname: string;
  file: File;
}

class UploadVideo extends PureComponent {
  state = {
    uploading: false,
    uploadPercentage: 0,
    ftpFiles: []
  };

  _files: {
    thumbnail: File;
    video: File;
    teaser: File;
  } = {
      thumbnail: null,
      video: null,
      teaser: null
    };

  componentDidMount() {
    this.onGetFtpFiles();
  }

  async handleFtpUpload(data) {
    const {
      videoFileName, videoKeepFile, teaserFileName, teaserKeepFile,
      thumbnailFileName, thumbnailKeepFile, videoConvertFile, teaserConvertFile
    } = data;
    if (videoFileName === teaserFileName) {
      message.error('Video file should not be same teaser file');
      return;
    }
    try {
      const videoOptions = {
        fileName: videoFileName,
        keepOldFile: videoKeepFile,
        convertFile: videoConvertFile
      };
      const teaserOptions = {
        fileName: teaserFileName,
        keepOldFile: teaserKeepFile,
        convertFile: teaserConvertFile
      };
      const thumbnailOptions = {
        fileName: thumbnailFileName,
        keepOldFile: thumbnailKeepFile
      };
      await videoService.ftpUpload({
        ...data, videoOptions, teaserOptions, thumbnailOptions
      });
      message.success('Uploaded successfully');
      Router.push('/video');
    } catch (error) {
      message.error('An error occurred, please try again!');
      this.setState({ uploading: false });
    }
  }

  async onGetFtpFiles() {
    const resp = await fileService.getFtpFiles();
    resp?.data && this.setState({ ftpFiles: resp.data });
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  async submit(payload: any) {
    const submitData = { ...payload };
    if ((submitData.isSale && !submitData.price) || (submitData.isSale && submitData.price < 1)) {
      message.error('Invalid price');
      return;
    }
    if (!submitData.categoryIds || !submitData.categoryIds.length) delete submitData.categoryIds;
    if (!submitData.performerIds || !submitData.performerIds.length) delete submitData.performerIds;
    if (!submitData.tags || !submitData.tags.length) delete submitData.tags;
    await this.setState({
      uploading: true
    });
    if (payload.isFtpUpload) {
      this.handleFtpUpload(submitData);
      return;
    }
    try {
      const files = Object.keys(this._files).reduce((f, key) => {
        if (this._files[key]) {
          f.push({
            fieldname: key,
            file: this._files[key] || null
          });
        }
        return f;
      }, [] as IFiles[]) as [IFiles];
      if (!this._files.video) {
        message.error('Please select video!');
        return;
      }
      await videoService.uploadVideo(files, submitData, this.onUploading.bind(this));
      message.success('Uploaded successfully');
      Router.push('/video');
    } catch (error) {
      message.error('An error occurred, please try again!');
      this.setState({ uploading: false });
    }
  }

  render() {
    const { uploading, uploadPercentage, ftpFiles } = this.state;
    return (
      <Layout>
        <Head>
          <title>Upload video</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Video', href: '/video' }, { title: 'Upload new video' }]} />
        <Page>
          <FormUploadVideo
            submit={this.submit.bind(this)}
            beforeUpload={this.beforeUpload.bind(this)}
            uploading={uploading}
            uploadPercentage={uploadPercentage}
            ftpFiles={ftpFiles}
          />
        </Page>
      </Layout>
    );
  }
}

export default UploadVideo;
