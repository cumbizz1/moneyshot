/* eslint-disable react/require-default-props */
import { UploadOutlined } from '@ant-design/icons';
import { AvatarUpload } from '@components/user/avatar-upload';
import { CoverUpload } from '@components/user/cover-upload';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Progress,
  Row,
  Select,
  Upload
} from 'antd';
import { PureComponent } from 'react';
import { ICountry, IPerformer } from 'src/interfaces';

const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const { TextArea } = Input;

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  },
  number: {
    // eslint-disable-next-line no-template-curly-in-string
    range: 'Must be between ${min} and ${max}'
  }
};

interface IProps {
  onFinish: Function;
  user: IPerformer;
  updating?: boolean;
  options?: {
    uploadHeaders?: any;
    avatarUploadUrl?: string;
    onAvatarUploaded?: Function;
    coverUploadUrl?: string;
    onCoverUploaded?: Function;
    beforeUpload?: Function;
    videoUploadUrl?: string;
    onVideoUploaded?: Function;
    uploadPercentage?: number;
  };
  countries?: ICountry[];
}

export class PerformerAccountForm extends PureComponent<IProps> {
  state = {
    isUploadingVideo: false,
    uploadVideoPercentage: 0,
    previewVideo: null,
    checked: false
  };

  componentDidMount() {
    const { user } = this.props;
    const { previewVideo } = this.state;
    user
      && user.welcomeVideoPath
      && this.setState(
        {
          previewVideo: user.welcomeVideoPath
        },
        () => {
          if (previewVideo) {
            const video = document.getElementById('video') as HTMLVideoElement;
            video.setAttribute('src', previewVideo);
          }
        }
      );
  }

  handleVideoChange = (info: any) => {
    info.file
      && info.file.percent
      && this.setState({ uploadVideoPercentage: info.file.percent });
    if (info.file.status === 'uploading') {
      this.setState({ isUploadingVideo: true });
      return;
    }
    if (info.file.status === 'done') {
      message.success('Welcome video uploaded');
      this.setState(
        {
          isUploadingVideo: false,
          previewVideo: info.file.response.data && info.file.response.data.url
        },
        () => {
          const { previewVideo } = this.state;
          if (previewVideo) {
            const video = document.getElementById('video') as HTMLVideoElement;
            video.setAttribute('src', previewVideo);
          }
        }
      );
    }
  };

  handleCheckbox(e) {
    this.setState({ checked: e.target.checked });
  }

  render() {
    const {
      onFinish, user, updating, countries, options
    } = this.props;

    const {
      uploadHeaders,
      avatarUploadUrl,
      onAvatarUploaded,
      coverUploadUrl,
      onCoverUploaded,
      videoUploadUrl
    } = options;
    const {
      isUploadingVideo,
      uploadVideoPercentage,
      previewVideo,
      checked
    } = this.state;
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={(values) => {
          // eslint-disable-next-line no-param-reassign
          values.activateWelcomeVideo = checked;
          onFinish(values);
        }}
        validateMessages={validateMessages}
        initialValues={user}
        labelAlign="left"
        className="account-form"
      >
        <div
          className="top-profile"
          style={{
            position: 'relative',
            backgroundImage:
              user?.cover
                ? `url('${user.cover}')`
                : "url('/banner-image.jpg')"
          }}
        >
          <div className="avatar-upload">
            <AvatarUpload
              headers={uploadHeaders}
              uploadUrl={avatarUploadUrl}
              onUploaded={onAvatarUploaded}
              image={user.avatar}
            />
          </div>
          <div className="cover-upload">
            <CoverUpload
              headers={uploadHeaders}
              uploadUrl={coverUploadUrl}
              onUploaded={onCoverUploaded}
              options={{ fieldName: 'cover' }}
            />
          </div>
        </div>
        <Row>
          <Col md={12} sm={12} xs={12}>
            <Form.Item
              name="firstName"
              label="First name"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your first name!' },
                {
                  pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                  message:
                    'First name can not contain number and special character'
                }
              ]}
            >
              <Input placeholder="First name" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item
              name="lastName"
              label="Last name"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your last name!' },
                {
                  pattern: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                  message:
                    'Last name can not contain number and special character'
                }
              ]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item
              label="Display name"
              name="name"
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                { required: true, message: 'Please input your display name!' },
                {
                  pattern: /^(?=.*\S).+$/g,
                  message:
                    'Display name can not contain only whitespace'
                },
                {
                  min: 3,
                  message: 'Display name must containt at least 3 characters'
                }
              ]}
              hasFeedback
            >
              <Input placeholder="Display name" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="username" label="Username">
              <Input disabled placeholder="username" />
            </Form.Item>
          </Col>
          <Col md={24} sm={24} xs={24}>
            <Form.Item name="email" label="Email address">
              <Input disabled placeholder="email" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="country" rules={[{ required: true }]} label="Country">
              <Select
                placeholder="Select your country"
                showSearch
                filterOption={(input, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase())
                  >= 0}
              >
                {countries
                  && countries.length > 0
                  && countries.map((c) => (
                    <Option value={c.code} key={c.code}>
                      {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="state" label="State">
              <Input placeholder="Enter the state" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="city" label="City">
              <Input placeholder="Enter the city" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="address" label="Address">
              <Input placeholder="Enter the address" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="zipcode" label="Postal code">
              <Input placeholder="Zip code" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="height" label="Height">
              <Input placeholder="Height" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="weight" label="Weight">
              <Input placeholder="Weight" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="eyes" label="Eyes color">
              <Input placeholder="Eyes" />
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="gender" label="Gender">
              <Select>
                <Select.Option value="male" key="male">
                  Male
                </Select.Option>
                <Select.Option value="female" key="female">
                  Female
                </Select.Option>
                <Select.Option value="transgender" key="transgender">
                  Transgender
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="sexualPreference" label="Sexual preference">
              <Input placeholder="Sexual Preference" />
            </Form.Item>
          </Col>
          <Col md={24} xs={24}>
            <Form.Item name="bio" label="Bio">
              <TextArea rows={3} placeholder="Tell people something about you" />
            </Form.Item>
          </Col>

          <Col md={24} xs={24}>
            <Form.Item label="Welcome Video">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <div className="ant-col ant-col-16 ant-form-item-control">
                  <Upload
                    accept={'video/*'}
                    name="welcome-video"
                    showUploadList={false}
                    action={videoUploadUrl}
                    headers={uploadHeaders}
                    onChange={this.handleVideoChange.bind(this)}
                  >
                    {previewVideo && (
                      <video
                        controls
                        id="video"
                        style={{ width: '250px', marginBottom: '10px' }}
                      />
                    )}
                    <div className="clear" />
                    <Button>
                      <UploadOutlined />
                      {' '}
                      Select File
                    </Button>
                  </Upload>

                  {uploadVideoPercentage ? (
                    <Progress percent={Math.round(uploadVideoPercentage)} />
                  ) : null}
                </div>
              </div>
            </Form.Item>
          </Col>
          <Col md={24} xs={24}>
            <Form.Item>
              <Checkbox
                defaultChecked={!!user.activateWelcomeVideo}
                onChange={this.handleCheckbox.bind(this)}
              >
                Activate welcome video
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button
            className="primary"
            type="primary"
            htmlType="submit"
            loading={updating || isUploadingVideo}
            disabled={updating || isUploadingVideo}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
