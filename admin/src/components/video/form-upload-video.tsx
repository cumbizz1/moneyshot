/* eslint-disable jsx-a11y/label-has-associated-control */
import { CameraOutlined, FileAddOutlined, VideoCameraAddOutlined } from '@ant-design/icons';
import { SelectCategoryDropdown } from '@components/common/select-category-dropdown';
import { SelectPerformerDropdown } from '@components/common/select-performer-dropdown';
import { getExt } from '@lib/string';
import { getGlobalConfig } from '@services/config';
import {
  Button, Checkbox,
  Col, DatePicker,
  Form, Input, InputNumber, message, Progress, Row, Select, Switch, Upload
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import moment from 'moment';
import { createRef, PureComponent } from 'react';
import { IVideo } from 'src/interfaces';

import { BulkUploadPhotoForm } from './form-video-photos';

interface IProps {
  // eslint-disable-next-line react/require-default-props
  video?: IVideo;
  submit: Function;
  beforeUpload: Function;
  uploading: boolean;
  uploadPercentage: number;
  ftpFiles: string[];
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

export class FormUploadVideo extends PureComponent<IProps> {
  state = {
    previewThumbnail: null,
    previewVideo: null,
    previewTeaserVideo: null,
    isSchedule: false,
    scheduledAt: moment().add(1, 'day'),
    showUploadVideo: null,
    showUploadThumbnail: null,
    showUploadTeaser: null,
    isSale: false,
    isFtpUpload: false
  };

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    const { video } = this.props;
    if (video) {
      this.setState(
        {
          previewThumbnail: video?.thumbnail?.url || video?.thumbnail?.thumbnails[0] || '',
          previewVideo: video?.video?.url || '',
          previewTeaserVideo: video?.teaser?.url || '',
          isSchedule: video.isSchedule,
          isSale: video.isSale,
          scheduledAt: video.scheduledAt || moment().add(1, 'day')
        }
      );
    }
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  beforeUpload(file: File, field: string) {
    const config = getGlobalConfig();
    const { beforeUpload: beforeUploadHandler } = this.props;
    let maxSize = config.NEXT_PUBLIC_MAX_SIZE_FILE || 100;
    switch (field) {
      case 'thumbnail':
        maxSize = config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5;
        break;
      case 'teaser': maxSize = config.NEXT_PUBLIC_MAX_SIZE_TEASER || 200;
        break;
      case 'video': maxSize = config.NEXT_PUBLIC_MAX_SIZE_VIDEO || 2048;
        break;
      default: break;
    }
    const valid = file.size / 1024 / 1024 < maxSize;
    if (!valid) {
      message.error(`${field.toUpperCase()} must be smaller than ${maxSize}MB!`);
      return false;
    }
    if (field === 'thumbnail') this.setState({ showUploadThumbnail: file });
    if (field === 'teaser') this.setState({ showUploadTeaser: file });
    if (field === 'video') this.setState({ showUploadVideo: file });
    beforeUploadHandler(file, field);
    return false;
  }

  render() {
    const config = getGlobalConfig();
    if (!this.formRef) this.formRef = createRef();
    const {
      video, submit, uploading, uploadPercentage = 0, ftpFiles = []
    } = this.props;
    const {
      previewThumbnail, previewVideo, isSchedule, previewTeaserVideo, scheduledAt,
      showUploadTeaser, showUploadThumbnail, showUploadVideo, isSale, isFtpUpload
    } = this.state;
    const ftpVideoFiles = ftpFiles && ftpFiles.filter((f) => {
      const ext = getExt(f);
      return ['.mov', '.avi', '.wmv', '.flv', '.3gp', '.mp4', '.mpg', '.mpeg'].includes(ext);
    });
    const ftpPhotoFiles = ftpFiles && ftpFiles.filter((f) => {
      const ext = getExt(f);
      return ['.gif', '.jpg', '.jpeg', '.svg', '.png', '.heic', '.ico'].includes(ext);
    });
    return (
      <Form
        {...layout}
        onFinish={(values) => {
          const data = { ...values };
          if (data.status === 'file-error') {
            message.error('Video file is on error, please upload new one');
            return;
          }
          if (data.isSchedule) {
            data.scheduledAt = scheduledAt;
          }
          if (data.tags && data.tags.length) {
            data.tags = data.tags.map((t) => t.replace(/\s+/g, '_').toLowerCase());
          }
          submit(data);
        }}
        onFinishFailed={() => message.error('Please complete the required fields')}
        name="form-upload"
        ref={this.formRef}
        validateMessages={validateMessages}
        initialValues={
          video || ({
            title: '',
            price: 9.99,
            description: '',
            status: 'active',
            performerIds: [],
            tags: [],
            categoryIds: [],
            isSale: false,
            isSchedule: false,
            isFtpUpload: false,
            thumbnailKeepFile: false,
            teaserKeepFile: false,
            videoKeepFile: false,
            videoConvertFile: true,
            teaserConvertFile: true
          })
        }
      >
        <Row>
          <Col lg={12} xs={12}>
            <Form.Item name="title" rules={[{ required: true, message: 'Please input title of video!' }]} label="Title">
              <Input placeholder="Enter video title" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={12}>
            <Form.Item label="Performers" name="performerIds">
              <SelectPerformerDropdown
                noEmtpy
                defaultValue={video && video.performerIds}
                onSelect={(val) => this.setFormVal('performerIds', val)}
                isMultiple
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={12}>
            <Form.Item label="Categories" name="categoryIds">
              <SelectCategoryDropdown
                noEmtpy
                defaultValue={video && video.categoryIds}
                group="video"
                onSelect={(val) => this.setFormVal('categoryIds', val)}
                isMultiple
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={12}>
            <Form.Item label="Tags" name="tags">
              <Select
                defaultValue={video && video.tags}
                onChange={(val) => this.setFormVal('tags', val)}
                mode="tags"
                style={{ width: '100%' }}
                size="middle"
                showArrow={false}
                defaultActiveFirstOption={false}
                placeholder="Add Tags"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={12}>
            <Form.Item name="isSale" label="PPV?" valuePropName="checked">
              <Switch unCheckedChildren="Subscribe to view" checkedChildren="Pay per view" onChange={(checked) => this.setState({ isSale: checked })} />
            </Form.Item>
          </Col>
          {isSale && (
            <Col lg={12} xs={12}>
              <Form.Item name="price" label="Price">
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          )}
          <Col lg={12} xs={12}>
            <Form.Item name="isSchedule" label="Type" valuePropName="checked">
              <Switch unCheckedChildren="Recent" checkedChildren="Upcoming" onChange={(checked) => this.setState({ isSchedule: checked })} />
            </Form.Item>
          </Col>
          {isSchedule && (
            <Col lg={12} xs={12}>
              <Form.Item label="Upcoming at">
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(currentDate) => currentDate && currentDate < moment().endOf('day')}
                  defaultValue={video && video.scheduledAt ? moment(video.scheduledAt) : moment().add(1, 'day')}
                  onChange={(date) => this.setState({ scheduledAt: date })}
                />
              </Form.Item>
            </Col>
          )}
          <Col lg={24} xs={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col lg={24} xs={24}>
            <Form.Item name="isFtpUpload" label="FTP upload?" valuePropName="checked">
              <Switch unCheckedChildren="Non-ftp upload" checkedChildren="Ftp upload" onChange={(checked) => this.setState({ isFtpUpload: checked })} />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            {!isFtpUpload ? (
              <Form.Item
                label="Video"
                help={
                (showUploadVideo && <a>{showUploadVideo.name}</a>)
                || (previewVideo && video.processing && <a>Video is on processing...</a>)
                || (previewVideo && !video.processing && <a href={previewVideo} target="_blank" rel="noreferrer">Click here to preview</a>)
                || `Video file is ${config.NEXT_PUBLIC_MAX_SIZE_VIDEO || 2048}MB or below`
              }
              >
                <Upload
                  customRequest={() => false}
                  listType="picture-card"
                  className="avatar-uploader"
                  accept="video/*"
                  multiple={false}
                  showUploadList={false}
                  disabled={uploading}
                  beforeUpload={(file) => this.beforeUpload(file, 'video')}
                >
                  {showUploadVideo ? <FileAddOutlined /> : <VideoCameraAddOutlined />}
                </Upload>
              </Form.Item>
            ) : (
              <Form.Item
                label="Video"
                name="videoFileName"
              >
                <Select showSearch>
                  {ftpVideoFiles.map((file) => (
                    <Select.Option key={file} value={file}>
                      {file}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item name="videoKeepFile" valuePropName="checked">
              <Checkbox>Keep file after finished</Checkbox>
            </Form.Item>
            <Form.Item name="videoConvertFile" valuePropName="checked">
              <Checkbox>System will convert file to Mp4 h264. You can untick if your file is playable on browsers</Checkbox>
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            {!isFtpUpload ? (
              <Form.Item
                label="Teaser"
                help={
                (showUploadTeaser && <a>{showUploadTeaser.name}</a>)
                || (previewTeaserVideo && video.teaserProcessing && <a>Teaser is on processing...</a>)
                || (previewTeaserVideo && !video.teaserProcessing && <a href={previewTeaserVideo} target="_blank" rel="noreferrer">Click here to preview</a>)
                || `Teaser is ${config.NEXT_PUBLIC_MAX_SIZE_TEASER || 200}MB or below`
              }
              >
                <Upload
                  customRequest={() => false}
                  listType="picture-card"
                  className="avatar-uploader"
                  accept="video/*"
                  multiple={false}
                  showUploadList={false}
                  disabled={uploading}
                  beforeUpload={(file) => this.beforeUpload(file, 'teaser')}
                >
                  {showUploadTeaser ? <FileAddOutlined /> : <VideoCameraAddOutlined />}
                </Upload>
              </Form.Item>
            ) : (
              <Form.Item
                label="Teaser"
                name="teaserFileName"
              >
                <Select showSearch>
                  {ftpVideoFiles.map((file) => (
                    <Select.Option key={file} value={file}>
                      {file}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item name="teaserKeepFile" valuePropName="checked">
              <Checkbox>Keep file after finished</Checkbox>
            </Form.Item>
            <Form.Item name="teaserConvertFile" valuePropName="checked">
              <Checkbox>System will convert file to Mp4 h264. You can untick if your file is playable on browsers</Checkbox>
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            {!isFtpUpload ? (
              <Form.Item
                label="Thumbnail"
                help={
                (showUploadThumbnail && <a>{showUploadThumbnail.name}</a>)
                || (previewThumbnail && <a href={previewThumbnail} target="_blank" rel="noreferrer">Click here to preview</a>)
                || `Thumbnail is ${config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}MB or below`
              }
              >
                <Upload
                  customRequest={() => false}
                  listType="picture-card"
                  className="avatar-uploader"
                  accept="image/*"
                  multiple={false}
                  showUploadList={false}
                  disabled={uploading}
                  beforeUpload={(file) => this.beforeUpload(file, 'thumbnail')}
                >
                  {showUploadThumbnail ? <FileAddOutlined /> : <CameraOutlined />}
                </Upload>
              </Form.Item>
            ) : (
              <Form.Item
                label="Thumbnail"
                name="thumbnailFileName"
              >
                <Select showSearch>
                  {ftpPhotoFiles.map((file) => (
                    <Select.Option key={file} value={file}>
                      {file}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item name="thumbnailKeepFile" valuePropName="checked">
              <Checkbox>Keep file after finished</Checkbox>
            </Form.Item>
          </Col>
          <Col lg={24} xs={24}>
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
          </Col>
        </Row>
        {video && (
          <BulkUploadPhotoForm targetId={video._id} />
        )}
        {uploadPercentage > 0 ? (
          <Progress percent={Math.round(uploadPercentage)} />
        ) : null}
        <Form.Item className="text-center" style={{ margin: 10 }}>
          <Button type="primary" htmlType="submit" disabled={uploading} loading={uploading}>
            {video ? 'Update' : 'Upload'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
