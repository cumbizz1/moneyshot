/* eslint-disable react/require-default-props */
/* eslint-disable no-template-curly-in-string */
import { SelectCategoryDropdown } from '@components/common/select-category-dropdown';
import { AvatarUpload } from '@components/user/avatar-upload';
import { CoverUpload } from '@components/user/cover-upload';
import { authService, performerService, utilsService } from '@services/index';
import {
  Button, Col, DatePicker,
  Form, Input, message, Row, Select
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import moment from 'moment';
import { createRef, PureComponent } from 'react';
import {
  IBody,
  ICountry, ILangguges, IPerformer, IPhoneCodes
} from 'src/interfaces';

import style from './account-form.module.less';

const { Option } = Select;

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  },
  number: {
    range: 'Must be between ${min} and ${max}'
  }
};

const { TextArea } = Input;

interface IProps {
  onFinish: Function;
  onUploaded: Function;
  performer?: IPerformer;
  submiting?: boolean;
  countries: ICountry[];
  languages: ILangguges[];
  phoneCodes?: IPhoneCodes[];
  bodyInfo?: IBody;
  avatarUrl?: string;
  coverUrl?: string;
}

export class AccountForm extends PureComponent<IProps> {
  formRef: any;

  state = {
    selectedPhoneCode: '+1',
    dateOfBirth: '',
    states: [],
    cities: []
  };

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    const { performer } = this.props;
    if (performer?.country) {
      this.handleGetStates(performer?.country || 'US');
      if (performer?.state) {
        this.handleGetCities(performer?.state, performer?.country);
      }
    }
  }

  handleGetStates = async (countryCode: string) => {
    const { performer } = this.props;
    const resp = await utilsService.statesList(countryCode);
    const eState = resp.data.find((s) => s === performer?.state);
    this.setState({ states: resp.data });
    if (eState) {
      this.formRef.setFieldsValue({ state: eState });
    } else {
      this.formRef.setFieldsValue({ state: '', city: '' });
    }
  };

  handleGetCities = async (state: string, countryCode: string) => {
    const { performer } = this.props;
    const resp = await utilsService.citiesList(countryCode, state);
    this.setState({ cities: resp.data });
    const eCity = resp.data.find((s) => s === performer?.city);
    if (eCity) {
      this.formRef.setFieldsValue({ city: eCity });
    } else {
      this.formRef.setFieldsValue({ city: '' });
    }
  };

  setFormVal(field: string, val: any) {
    const instance = this.formRef as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      performer, onFinish, submiting, countries, bodyInfo, languages, onUploaded,
      avatarUrl, coverUrl, phoneCodes
    } = this.props;
    const {
      heights = [], weights = [], bodyTypes = [], genders = [], sexualOrientations = [], ethnicities = [],
      hairs = [], pubicHairs = [], eyes = [], butts = []
    } = bodyInfo as any;
    const {
      selectedPhoneCode, dateOfBirth, states, cities
    } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Form
        ref={(ref) => { this.formRef = ref; }}
        {...layout}
        name="form-performer"
        onFinish={(payload) => {
          const values = payload;
          values.phoneCode = selectedPhoneCode;
          values.dateOfBirth = dateOfBirth;
          onFinish(values);
        }}
        onFinishFailed={() => message.error('Please complete the required fields in tab general info')}
        validateMessages={validateMessages}
        initialValues={
          performer || ({
            country: 'US',
            status: 'active',
            gender: 'male',
            sexualOrientation: 'female',
            phoneCode: '+1',
            languages: ['English'],
            verifiedEmail: false
          })
        }
      >
        <Row>
          {performer && (
            <Col xs={24} md={24}>
              <div
                className={style['top-profile']}
                style={{
                  position: 'relative',
                  marginBottom: 25,
                  backgroundImage:
                    coverUrl
                      ? `url('${coverUrl}')`
                      : "url('/banner-image.jpg')"
                }}
              >
                <div className={style['avatar-upload']}>
                  <AvatarUpload
                    headers={uploadHeaders}
                    uploadUrl={performerService.getAvatarUploadUrl()}
                    onUploaded={onUploaded.bind(this, 'avatarId')}
                    image={avatarUrl}
                  />
                </div>
                <div className={style['cover-upload']}>
                  <CoverUpload
                    options={{ fieldName: 'cover' }}
                    headers={uploadHeaders}
                    uploadUrl={performerService.getCoverUploadUrl()}
                    onUploaded={onUploaded.bind(this, 'coverId')}
                  />
                </div>
              </div>
            </Col>
          )}
          <Col xs={12} md={12}>
            <Form.Item
              name="name"
              label="Display name"
              rules={[
                { required: true }, {
                  pattern: /^(?=.*\S).+$/g,
                  message: 'Display name can not contain only whitespace'
                }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item
              name="username"
              label="Nick name"
              rules={[
                { required: true, message: 'Please input nickname!' },
                {
                  pattern: /^[a-zA-Z0-9]+$/g,
                  message:
                    'Nick name must contain alphanumerics only'
                },
                { min: 3, message: 'Nick name must containt at least 3 characters' }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="firstName" label="Family name">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="lastName" label="Given name">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="gender" label="Gender">
              <Select>
                {genders.map((e) => (
                  <Option key={e.value} value={e.value}>
                    {e.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="email" label="Email address">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item
              name="bio"
              label="Bio"
            >
              <TextArea rows={3} minLength={1} />
            </Form.Item>
          </Col>
          <Col md={12} xs={12}>
            <Form.Item
              label="Date of Birth"
              validateTrigger={['onChange', 'onBlur']}
            >
              <DatePicker
                placeholder="YYYY-MM-DD"
                defaultValue={performer?.dateOfBirth ? moment(performer.dateOfBirth) as any : ''}
                onChange={(date) => this.setState({ dateOfBirth: date })}
                disabledDate={(currentDate) => currentDate && currentDate > moment().subtract(18, 'years').endOf('day')}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item label="Categories" name="categoryIds">
              <SelectCategoryDropdown
                noEmtpy
                group="performer"
                defaultValue={performer && performer.categoryIds}
                onSelect={(val) => this.setFormVal('categoryIds', val)}
                isMultiple
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                {
                  pattern: /^[0-9]{9,12}$/,
                  message: 'Enter 9-12 digits phone number'
                }
              ]}
            >
              <Input
                placeholder="9-12 digits phone number"
                addonBefore={(
                  <Select style={{ width: 120 }} defaultValue={performer?.phoneCode || '+1'} optionFilterProp="label" showSearch onChange={(val) => this.setState({ selectedPhoneCode: val })}>
                    {phoneCodes && phoneCodes.map((p) => <Option key={p.code} value={p.code} label={`${p.code} ${p.name}`}>{`${p.code} ${p.name}`}</Option>)}
                  </Select>
                )}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item
              name="languages"
              label="Languages"
            >
              <Select mode="multiple">
                {languages.map((l) => (
                  <Select.Option key={l.code} value={l.name || l.code}>
                    {l.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="country" label="Country">
              <Select
                showSearch
                optionFilterProp="label"
                onChange={(val: string) => this.handleGetStates(val)}
              >
                {countries.map((country) => (
                  <Select.Option key={country.code} label={country.name} value={country.code}>
                    <img src={country.flag} width="25px" alt="flag" />
                    {' '}
                    {country.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="state" label="State">
              <Select
                placeholder="Select your state"
                optionFilterProp="label"
                showSearch
                onChange={(val: string) => this.handleGetCities(val, this.formRef.getFieldValue('country'))}
              >
                {states.map((state) => (
                  <Option value={state} label={state} key={state}>
                    {state}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col md={12} sm={12} xs={12}>
            <Form.Item name="city" label="City">
              <Select
                placeholder="Select your city"
                optionFilterProp="label"
                showSearch
              >
                {cities.map((city) => (
                  <Option value={city} label={city} key={city}>
                    {city}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="zipcode" label="Zipcode">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="ethnicity" label="Ethnicity">
              <Select>
                {ethnicities.map((e) => (
                  <Option key={e.value} value={e.value}>
                    {e.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="bodyType" label="Body Type">
              <Select>
                {bodyTypes.map((e) => (
                  <Option key={e.value} value={e.value}>
                    {e.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="eyes" label="Eye color">
              <Select>
                {eyes.map((e) => (
                  <Option key={e.value} value={e.value}>
                    {e.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="hair" label="Hair color">
              <Select>
                {hairs.map((e) => (
                  <Option key={e.value} value={e.value}>
                    {e.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="height" label="Height">
              <Select showSearch>
                {heights
                  && heights.map((h) => (
                    <Option key={h.value} value={h.value}>
                      {h.text}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="weight" label="Weight">
              <Select showSearch>
                {weights
                  && weights.map((w) => (
                    <Option key={w.value} value={w.value}>
                      {w.text}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="butt" label="Butt size">
              <Select>
                {butts.map((e) => (
                  <Option key={e.value} value={e.value}>
                    {e.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="pubicHair" label="Pubic hair">
              <Select>
                {pubicHairs.map((e) => (
                  <Option key={e.value} value={e.value}>
                    {e.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} md={12}>
            <Form.Item name="sexualOrientation" label="Sexual Orientation">
              <Select>
                {sexualOrientations.map((e) => (
                  <Option key={e.value} value={e.value}>
                    {e.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={24}>
            <Form.Item name="status" label="Status">
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
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
            <Button type="primary" htmlType="submit" loading={submiting}>
              Submit
            </Button>
          </Form.Item>
        </Row>
      </Form>
    );
  }
}
