import { CameraOutlined, HomeOutlined } from '@ant-design/icons';
import Page from '@components/common/layout/page';
import { postService } from '@services/post.service';
import {
  Breadcrumb, Button, Form, Input, message, Select, Upload
} from 'antd';
import { NextPageContext } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

const WYSIWYG = dynamic(() => import('@components/wysiwyg'), {
  ssr: false
});
class PostCreate extends PureComponent<any> {
  private _content: string = '';

  private imageToUpload = null;

  state = {
    submiting: false,
    imageUrl: null
  };

  static async getInitialProps(ctx: NextPageContext) {
    const { query } = ctx;
    if (!query.type) {
      query.type = 'post';
    }
    return query;
  }

  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  beforeUpload = (file) => {
    this.imageToUpload = null;
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error('Image must smaller than 5MB!');
    }

    this.imageToUpload = file;
    this.getBase64(file, (imageUrl) => this.setState({
      imageUrl
    }));
    return false;
  };

  contentChange(content: { [html: string]: string }) {
    this._content = content.html;
  }

  async submit(data: any) {
    const { type } = this.props;

    try {
      this.setState({ submiting: true });

      const submitData = {
        ...data,
        content: this._content,
        type
      };
      await postService.create(submitData, this.imageToUpload);
      message.success('Created successfully');
      // TODO - redirect
      Router.push(
        {
          pathname: '/posts'
        },
        '/posts'
      );
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
    } finally {
      this.setState({ submiting: false });
    }
  }

  render() {
    const { submiting, imageUrl } = this.state;
    return (
      <>
        <Head>
          <title>Create new post</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/posts">
              <span>Posts</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Create new post</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <Page>
          <Form
            onFinish={this.submit.bind(this)}
            initialValues={{
              title: '',
              shortDescription: '',
              status: 'published',
              ordering: 0
            }}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Form.Item name="title" rules={[{ required: true, message: 'Please input title!' }]} label="Title">
              <Input placeholder="Enter your title" />
            </Form.Item>
            {/* <Form.Item name="slug" label="Slug">
              <Input placeholder="Custom friendly slug" />
            </Form.Item> */}
            <Form.Item name="shortDescription" label="Short description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Content">
              <WYSIWYG onChange={this.contentChange.bind(this)} html={this._content} />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="published">Active</Select.Option>
                <Select.Option value="draft">Inactive</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Image">
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={this.beforeUpload}
              >
                {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : <CameraOutlined />}
              </Upload>
            </Form.Item>
            <Form.Item wrapperCol={{ span: 24, offset: 4 }}>
              <Button type="primary" htmlType="submit" disabled={submiting} loading={submiting}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Page>
      </>
    );
  }
}

export default PostCreate;
