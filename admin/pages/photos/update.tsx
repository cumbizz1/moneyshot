import { BreadcrumbComponent } from '@components/common';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { FormUploadPhoto } from '@components/photo/form-upload-photo';
import { photoService } from '@services/photo.service';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { IPhoto } from 'src/interfaces';

interface IProps {
  id: string;
}
class PhotoUpdate extends PureComponent<IProps> {
  state = {
    submiting: false,
    fetching: true,
    photo: {} as IPhoto
  };

  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  async componentDidMount() {
    const { id } = this.props;
    try {
      const resp = await photoService.findById(id);
      this.setState({ photo: resp.data });
    } catch (e) {
      message.error('Photo not found!');
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
      await photoService.update(id, submitData);
      message.success('Updated successfully');
      Router.push('/photos');
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { photo, submiting, fetching } = this.state;
    return (
      <>
        <Head>
          <title>Update Photo</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Photos', href: '/photos' },
            { title: photo.title ? photo.title : 'Detail photo' },
            { title: 'Update' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <FormUploadPhoto
              photo={photo}
              submit={this.submit.bind(this)}
              uploading={submiting}
            />
          )}
        </Page>
      </>
    );
  }
}

export default PhotoUpdate;
