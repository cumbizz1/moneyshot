/* eslint-disable no-param-reassign */
import { BreadcrumbComponent } from '@components/common';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { FormUploadVideo } from '@components/video/form-upload-video';
import { fileService, videoService } from '@services/index';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces';

interface IProps {
  id: string;
}

interface IFiles {
  fieldname: string;
  file: File;
}

class VideoUpdate extends PureComponent<IProps> {
  state = {
    submiting: false,
    fetching: true,
    video: {} as IVideo,
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
  } as any;

  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  async componentDidMount() {
    this.getVideoDetails();
    this.onGetFtpFiles();
  }

  async handleFtpUpload(data: any) {
    const { id } = this.props;
    try {
      if (data.videoFileName && data.teaserFileName && data.videoFileName === data.teaserFileName) {
        message.error('Video file should not be same teaser file');
        return;
      }
      await videoService.ftpUpdate(data, id);
      message.success('Uploaded successfully');
      Router.push('/video');
    } catch (error) {
      message.error('An error occurred, please try again!');
      this.setState({ submiting: false });
    }
  }

  async onGetFtpFiles() {
    const resp = await fileService.getFtpFiles();
    resp?.data && this.setState({ ftpFiles: resp.data });
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  async getVideoDetails() {
    const { id } = this.props;
    try {
      const resp = await videoService.findById(id);
      this.setState({ video: resp.data, fetching: false });
    } catch (e) {
      message.error('Video was not found!');
      this.setState({ fetching: false });
    }
  }

  beforeUpload(file: File, field: 'teaser'|'video'|'thumbnail') {
    this._files[field] = file;
  }

  async submit(data: any) {
    const { id } = this.props;
    try {
      if ((data.isSale && !data.price) || (data.isSale && data.price < 1)) {
        message.error('Invalid price');
        return;
      }
      const {
        videoFileName, videoKeepFile, teaserFileName, teaserKeepFile,
        thumbnailFileName, thumbnailKeepFile, videoConvertFile, teaserConvertFile
      } = data;
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
      const submitData = {
        ...data, videoOptions, teaserOptions, thumbnailOptions
      };
      if (!submitData.categoryIds || !submitData.categoryIds.length) delete submitData.categoryIds;
      if (!submitData.performerIds || !submitData.performerIds.length) delete submitData.performerIds;
      if (!submitData.tags || !submitData.tags.length) delete submitData.tags;
      const files = Object.keys(this._files).reduce((f, key) => {
        if (this._files[key]) {
          f.push({
            fieldname: key,
            file: this._files[key] || null
          });
        }
        return f;
      }, [] as IFiles[]) as [IFiles];
      await this.setState({ submiting: true });
      if (submitData.isFtpUpload) {
        this.handleFtpUpload(submitData);
        return;
      }
      await videoService.update(id, files, submitData, this.onUploading.bind(this));
      message.success('Updated successfully');
      Router.back();
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const {
      video, submiting, fetching, uploadPercentage, ftpFiles
    } = this.state;
    return (
      <>
        <Head>
          <title>Update Video</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Video', href: '/video' }, { title: video.title ? video.title : 'Detail video' }]}
        />
        <Page>
          {fetching && <Loader />}
          {!fetching && video && (
          <FormUploadVideo
            ftpFiles={ftpFiles}
            beforeUpload={this.beforeUpload.bind(this)}
            uploadPercentage={uploadPercentage}
            video={video}
            submit={this.submit.bind(this)}
            uploading={submiting}
          />
          )}
        </Page>
      </>
    );
  }
}

export default VideoUpdate;
