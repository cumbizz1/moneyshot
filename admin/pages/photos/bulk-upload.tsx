import { UploadOutlined } from '@ant-design/icons';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { SelectGalleryDropdown } from '@components/gallery/common/select-gallery-dropdown';
import { getExt } from '@lib/index';
import { getGlobalConfig } from '@services/config';
import { fileService, photoService } from '@services/index';
import {
  Button, Checkbox,
  Form, Input, Layout, message, Select, Switch, Upload
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import Head from 'next/head';
import Router from 'next/router';
import { createRef, PureComponent } from 'react';

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

const { Dragger } = Upload;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

interface IProps {
  targetId: string;
}

export default class BulkUploadPhoto extends PureComponent<IProps> {
  formRef: any;

  state = {
    uploading: false,
    fileList: [],
    ftpFiles: [],
    isFtpUpload: false
  };

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    this.onGetFtpFiles();
  }

  async onGetFtpFiles() {
    const resp = await fileService.getFtpFiles();
    resp?.data && this.setState({ ftpFiles: resp.data });
  }

  onUploading(file, resp: any) {
    // eslint-disable-next-line no-param-reassign
    file.percent = resp.percentage;
    this.forceUpdate();
  }

  onRemove = (file) => {
    const { fileList } = this.state;
    this.setState({ fileList: fileList.filter((f) => f.uid !== file.uid) });
  };

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  async beforeUpload(file, fileList) {
    const config = getGlobalConfig();
    if (file.size / 1024 / 1024 > (config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5)) {
      message.error(`${file.name} is over ${config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}MB`);
      return false;
    }
    getBase64(file, (imageUrl) => {
      // eslint-disable-next-line no-param-reassign
      file.thumbUrl = imageUrl;
    });
    this.setState({
      fileList: fileList.filter((f) => f.size / 1024 / 1024 < (config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5))
    });
    return true;
  }

  async submit(data: any) {
    const { fileList, isFtpUpload } = this.state;
    if (isFtpUpload) {
      if (!data.photoFilesName) {
        message.error('Please select photos!');
        return;
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const photoFileName of data.photoFilesName) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await photoService.ftpUpload({
            ...data,
            title: photoFileName,
            photoFileName,
            target: 'gallery'
          });
        } catch (e) {
          message.error(`File ${photoFileName} error!`);
        }
      }
    } else {
      const uploadFiles = fileList.filter((f) => !['uploading', 'done'].includes(f.status));
      if (!uploadFiles.length) {
        message.error('Please select photos');
        return;
      }
      await this.setState({ uploading: true });
      // eslint-disable-next-line no-restricted-syntax
      for (const file of uploadFiles) {
        try {
        // eslint-disable-next-line no-continue
          if (['uploading', 'done'].includes(file.status)) continue;
          file.status = 'uploading';
          // eslint-disable-next-line no-await-in-loop
          await photoService.uploadPhoto(file, { ...data, target: 'gallery' }, this.onUploading.bind(this, file));
          file.status = 'done';
          file.response = { status: 'success' };
        } catch (e) {
          file.status = 'error';
          message.error(`File ${file.name} error!`);
        }
      }
    }

    message.success('Upload photos success!');
    Router.replace('/gallery');
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { targetId } = this.props;
    const {
      uploading, fileList, ftpFiles, isFtpUpload
    } = this.state;
    const ftpPhotoFiles = ftpFiles && ftpFiles.filter((f) => {
      const ext = getExt(f);
      return ['.gif', '.jpg', '.jpeg', '.svg', '.png', '.heic', '.ico'].includes(ext);
    });
    return (
      <Layout>
        <Head>
          <title>Bulk Upload</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Photos', href: '/photos' }, { title: 'Bulk upload' }]} />
        <Page>
          <Form
            {...layout}
            onFinish={this.submit.bind(this)}
            onFinishFailed={() => message.error('Please complete the required fields')}
            name="form-upload"
            ref={this.formRef}
            validateMessages={validateMessages}
            initialValues={{
              status: 'active',
              targetId: targetId || '',
              isFtpUpload: false,
              photoKeepFile: false
            }}
          >
            <Form.Item
              name="targetId"
              label="Gallery"
              rules={[{ required: true, message: 'Please select a gallery' }]}
            >
              <SelectGalleryDropdown
                disabled={uploading}
                onSelect={(val) => this.setFormVal('targetId', val)}
                defaultValue={targetId || ''}
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea maxLength={500} />
            </Form.Item>
            <Form.Item label="FTP upload?" valuePropName="checked">
              <Switch unCheckedChildren="Non-ftp upload" checkedChildren="Ftp upload" onChange={(checked) => this.setState({ isFtpUpload: checked })} />
            </Form.Item>
            {!isFtpUpload ? (
              <Form.Item label="Photos">
                <Dragger
                  customRequest={() => false}
                  accept="image/*"
                  beforeUpload={this.beforeUpload.bind(this)}
                  multiple
                  showUploadList
                  fileList={fileList}
                  onRemove={this.onRemove}
                  disabled={uploading}
                  listType="picture"
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag files to this area to upload</p>
                  <p className="ant-upload-hint">
                    Photo must be
                    {' '}
                    {getGlobalConfig().NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}
                    MB or below
                  </p>
                </Dragger>
              </Form.Item>
            ) : (
              <Form.Item
                label="Photos"
                name="photoFilesName"
                rules={[
                  { required: true, message: 'Please select Ftp file' }
                ]}
              >
                <Select showSearch mode="multiple" allowClear>
                  {ftpPhotoFiles.map((file) => (
                    <Select.Option key={file} value={file}>
                      {file}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item name="photoKeepFile" valuePropName="checked">
              <Checkbox>Keep file after finished</Checkbox>
            </Form.Item>
            <Form.Item className="text-center">
              <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>
                Upload All
              </Button>
            </Form.Item>
          </Form>
        </Page>
      </Layout>
    );
  }
}
