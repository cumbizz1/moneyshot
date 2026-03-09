/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { CameraOutlined } from '@ant-design/icons';
import { SelectGalleryDropdown } from '@components/gallery/common/select-gallery-dropdown';
import { ThumbnailPhoto } from '@components/photo/thumbnail-photo';
import { getExt } from '@lib/index';
import { fileService, getGlobalConfig } from '@services/index';
import {
  Button, Checkbox, Form, Input, message, Progress, Select, Switch,
  Upload
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import { createRef, PureComponent } from 'react';
import { IPhoto } from 'src/interfaces';

interface IProps {
  photo?: IPhoto;
  submit?: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

export class FormUploadPhoto extends PureComponent<IProps> {
  formRef: any;

  state = {
    isFtpUpload: false,
    ftpPhotoFiles: []
  };

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    this.onGetFtpFiles();
  }

  async onGetFtpFiles() {
    const resp = await fileService.getFtpFiles();
    if (resp?.data) {
      const ftpPhotoFiles = resp.data && resp.data.filter((f) => {
        const ext = getExt(f);
        return ['.gif', '.jpg', '.jpeg', '.svg', '.png', '.heic', '.ico'].includes(ext);
      });
      this.setState({ ftpPhotoFiles });
    }
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  beforeUpload(file) {
    const config = getGlobalConfig();
    const { beforeUpload: handleUpload } = this.props;
    const isMaxSize = file.size / 1024 / 1024 < (config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5);
    if (!isMaxSize) {
      message.error(`Image must be ${config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}MB or below`);
      return false;
    }
    handleUpload(file);
    return true;
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      photo, submit, uploading, uploadPercentage
    } = this.props;
    const { ftpPhotoFiles, isFtpUpload } = this.state;
    const havePhoto = !!photo;
    const config = getGlobalConfig();
    return (
      <Form
        {...layout}
        onFinish={submit && submit.bind(this)}
        onFinishFailed={() => message.error('Please complete the required fields')}
        name="form-upload"
        ref={this.formRef}
        validateMessages={validateMessages}
        initialValues={
          photo || ({
            title: '',
            description: '',
            status: 'active',
            targetId: '',
            target: 'gallery',
            photoKeepFile: false
          })
        }
      >
        <Form.Item name="targetId" label="Gallery" rules={[{ required: true, message: 'Please select a gallery' }]}>
          <SelectGalleryDropdown
            disabled={uploading}
            defaultValue={(photo && photo?.targetId) || ''}
            onSelect={(val) => this.setFormVal('targetId', val)}
          />
        </Form.Item>
        <Form.Item name="title" rules={[{ required: true, message: 'Please input title of photo!' }]} label="Title">
          <Input placeholder="Enter photo title" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
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
        {!havePhoto && (
        <Form.Item name="isFtpUpload" label="FTP upload?" valuePropName="checked">
          <Switch unCheckedChildren="Non-ftp upload" checkedChildren="Ftp upload" onChange={(checked) => this.setState({ isFtpUpload: checked })} />
        </Form.Item>
        )}
        {/* eslint-disable-next-line no-nested-ternary */}
        {!isFtpUpload && !havePhoto ? (
          <Form.Item label="Photo" help={`Image must be ${config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5} MB or below`}>
            <Upload
              accept={'image/*'}
              multiple={false}
              listType="picture-card"
              showUploadList
              disabled={uploading || havePhoto}
              beforeUpload={(file) => this.beforeUpload(file)}
            >
              <CameraOutlined />
            </Upload>
          </Form.Item>
        ) : isFtpUpload && !havePhoto ? (
          <Form.Item label="Photo" name="photoFileName">
            <Select showSearch>
              {ftpPhotoFiles.map((file) => (
                <Select.Option key={file} value={file}>
                  {file}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : <ThumbnailPhoto photo={photo} style={{ width: '250px' }} />}
        {!havePhoto && (
        <Form.Item name="photoKeepFile" valuePropName="checked">
          <Checkbox>Keep file after finished</Checkbox>
        </Form.Item>
        )}
        {uploadPercentage ? <Progress percent={uploadPercentage} /> : null}
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" loading={uploading}>
            {havePhoto ? 'Update' : 'Upload'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
