/* eslint-disable no-restricted-syntax */
import { UploadOutlined } from '@ant-design/icons';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { SelectCategoryDropdown } from '@components/common/select-category-dropdown';
import { SelectPerformerDropdown } from '@components/common/select-performer-dropdown';
import VideoUploadList from '@components/file/video-upload-list';
import { getExt } from '@lib/index';
import { getGlobalConfig } from '@services/config';
import { fileService, videoService } from '@services/index';
import {
  Button, Checkbox,
  DatePicker, Form, InputNumber, Layout, message, Select, Switch, Upload
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { uniqBy } from 'lodash';
import moment from 'moment';
import Head from 'next/head';
import Router from 'next/router';
import { createRef, PureComponent } from 'react';

const { Dragger } = Upload;

const validateMessages = {
  required: 'This field is required!'
};
interface IProps {}

class BulkUploadVideo extends PureComponent<IProps> {
  state = {
    isSale: false,
    isSchedule: false,
    scheduledAt: moment().add(1, 'day'),
    uploading: false,
    fileList: [],
    ftpFiles: [],
    isFtpUpload: false
  };

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    this.onGetFtpFiles();
  }

  async onGetFtpFiles() {
    const resp = await fileService.getFtpFiles();
    resp?.data && this.setState({ ftpFiles: resp.data });
  }

  onUploading(file, resp: any) {
    const a = file;
    a.percent = resp.percentage;
    if (file.percent === 100) a.status = 'done';
    this.forceUpdate();
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  beforeUpload(file, files) {
    const config = getGlobalConfig();
    const isValid = file.size / 1024 / 1024 < (config.NEXT_PUBLIC_MAX_SIZE_VIDEO || 2000);
    if (!isValid) {
      message.error(`File ${file.name} is too large`);
      // eslint-disable-next-line no-param-reassign
      files = files.filter((f) => f.uid === file.uid);
    }
    const { fileList } = this.state;
    this.setState({ fileList: uniqBy([...fileList, ...files], ((f) => f.name && f.size)) });
  }

  remove(file) {
    const { fileList } = this.state;
    this.setState({ fileList: fileList.filter((f) => f.uid !== file.uid) });
  }

  async submit(formValues: any) {
    const {
      fileList, isSale, isSchedule, scheduledAt, isFtpUpload
    } = this.state;
    await this.setState({ uploading: true });
    const payload = {
      ...formValues,
      isSale,
      isSchedule,
      scheduledAt
    };
    if (!payload.categoryIds || !payload.categoryIds.length) delete payload.categoryIds;
    if (!payload.performerIds || !payload.performerIds.length) delete payload.performerIds;
    if (!payload.tags || !payload.tags.length) delete payload.tags;
    if (isFtpUpload) {
      if (!formValues.videoFilesName) {
        message.error('Please select videos!');
        return;
      }
      for (const videoFileName of formValues.videoFilesName) {
        try {
          const videoOptions = {
            fileName: videoFileName,
            keepOldFile: formValues.videoKeepFile,
            convertFile: formValues.videoConvertFile
          };
          // eslint-disable-next-line no-await-in-loop
          await videoService.ftpUpload({
            ...payload,
            title: videoFileName,
            videoOptions
          });
        } catch (e) {
          message.error(`File ${videoFileName} error!`);
        }
      }
    } else {
      if (!fileList.length) {
        message.error('Please select video!');
        return;
      }
      const uploadFiles = fileList.filter((f) => !['uploading', 'done'].includes(f.status));
      if (!uploadFiles.length) {
        message.error('Please select videos!');
        return;
      }
      for (const file of uploadFiles) {
        try {
          // eslint-disable-next-line no-continue
          if (['uploading', 'done'].includes(file.status)) continue;
          // eslint-disable-next-line no-await-in-loop
          await videoService.uploadVideo(
            [
              {
                fieldname: 'video',
                file
              }
            ],
            { ...payload, title: file.name },
            this.onUploading.bind(this, file)
          );
        } catch (e) {
          message.error(`File ${file.name} error!`);
        }
      }
    }
    message.success('Video files has been uploaded!');
    Router.push('/video');
  }

  render() {
    const {
      uploading, fileList, isSale, isSchedule, scheduledAt, ftpFiles, isFtpUpload
    } = this.state;
    if (!this.formRef) this.formRef = createRef();
    const ftpVideoFiles = ftpFiles && ftpFiles.filter((f) => {
      const ext = getExt(f);
      return ['.mov', '.avi', '.wmv', '.flv', '.3gp', '.mp4', '.mpg', '.mpeg'].includes(ext);
    });
    return (
      <Layout>
        <Head>
          <title>Bulk Upload Video</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Video', href: '/video' }, { title: 'Bulk Upload Video' }]} />
        <Page>
          <Form
            layout="vertical"
            onFinish={this.submit.bind(this)}
            validateMessages={validateMessages}
            ref={this.formRef}
            initialValues={{
              status: 'inactive',
              performerIds: [],
              tags: [],
              categoryIds: [],
              isSale: false,
              isSchedule: false,
              price: 9.99,
              videoFilesName: [],
              videoConvertFile: true,
              videoKeepFile: false
            }}
          >
            <Form.Item name="performerIds" label="Performers">
              <SelectPerformerDropdown
                noEmtpy
                onSelect={(val) => this.setFormVal('performerIds', val)}
                disabled={uploading}
                defaultValue={[]}
                isMultiple
              />
            </Form.Item>
            <Form.Item name="categoryIds" label="Categories">
              <SelectCategoryDropdown
                noEmtpy
                onSelect={(val) => this.setFormVal('categoryIds', val)}
                disabled={uploading}
                group="video"
                isMultiple
              />
            </Form.Item>
            <Form.Item label="Tags" name="tags">
              <Select
                onChange={(val) => this.setFormVal('tags', val)}
                mode="tags"
                style={{ width: '100%' }}
                size="middle"
                showArrow={false}
                defaultActiveFirstOption={false}
                placeholder="Add Tags"
              />
            </Form.Item>
            <Form.Item name="isSale" label="PPV?" valuePropName="checked">
              <Switch unCheckedChildren="Subscribe to view" checkedChildren="Pay per view" onChange={(checked) => this.setState({ isSale: checked })} />
            </Form.Item>
            {isSale && (
            <Form.Item name="price" label="Price">
              <InputNumber min={1} />
            </Form.Item>
            )}
            <Form.Item name="isSchedule" label="Type" valuePropName="checked">
              <Switch unCheckedChildren="Recent" checkedChildren="Upcoming" onChange={(checked) => this.setState({ isSchedule: checked })} />
            </Form.Item>
            {isSchedule && (
            <Form.Item label="Upcoming at">
              <DatePicker
                style={{ width: '100%' }}
                disabledDate={(currentDate) => currentDate && currentDate < moment().endOf('day')}
                defaultValue={scheduledAt}
                onChange={(date) => this.setState({ scheduledAt: date })}
              />
            </Form.Item>
            )}
            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status!' }]}>
              <Select>
                <Select.Option key="active" value="active">
                  Active
                </Select.Option>
                <Select.Option key="inactive" value="inactive">
                  Inactive
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="isFtpUpload" label="FTP upload?" valuePropName="checked">
              <Switch unCheckedChildren="Non-ftp upload" checkedChildren="Ftp upload" onChange={(checked) => this.setState({ isFtpUpload: checked })} />
            </Form.Item>
            {!isFtpUpload ? (
              <Form.Item>
                <Dragger
                  customRequest={() => false}
                  accept="video/*"
                  beforeUpload={this.beforeUpload.bind(this)}
                  multiple
                  showUploadList={false}
                  disabled={uploading}
                  listType="picture"
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag-drop files to this area to upload</p>
                  <p className="ant-upload-hint">Support video format only</p>
                </Dragger>
              </Form.Item>
            ) : (
              <Form.Item
                label="Video files"
                name="videoFilesName"
                rules={[
                  { required: true, message: 'Please select Ftp files' }
                ]}
              >
                <Select showSearch mode="multiple" allowClear>
                  {ftpVideoFiles.map((file) => (
                    <Select.Option key={file} value={file}>
                      {file}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item name="videoConvertFile" valuePropName="checked">
              <Checkbox>System will convert file to Mp4 h264. You can untick if your file is playable on browsers. System will convert or keep file accordingly</Checkbox>
            </Form.Item>
            <Form.Item name="videoKeepFile" valuePropName="checked">
              <Checkbox>Keep file after finished</Checkbox>
            </Form.Item>
            <VideoUploadList files={fileList} remove={this.remove.bind(this)} />
            <Form.Item style={{ margin: '20px', textAlign: 'center' }}>
              <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>
                UPLOAD ALL
              </Button>
            </Form.Item>
          </Form>
        </Page>
      </Layout>
    );
  }
}

export default BulkUploadVideo;
