import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { ImageUpload } from '@components/file/image-upload';
import { SelectPostDropdown } from '@components/post/select-post-dropdown';
import { getResponseError } from '@lib/utils';
import { authService } from '@services/auth.service';
import { settingService } from '@services/setting.service';
import {
  Button, Form, Input, InputNumber, Menu, message, Radio,
  Switch
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { createRef, PureComponent } from 'react';
import { ISetting } from 'src/interfaces';

const WYSIWYG = dynamic(() => import('@components/wysiwyg'), {
  ssr: false
});

class Settings extends PureComponent {
  state = {
    updating: false,
    loading: false,
    selectedTab: 'general',
    list: []
  };

  formRef: any;

  dataChange = {} as any;

  componentDidMount() {
    this.formRef = createRef();
    this.loadSettings();
  }

  async handleTextEditerContentChange(key: string, content: { [html: string]: string }) {
    this[key] = content.html;
    this.setVal(key, content.html);
    this.dataChange[key] = content.html;
  }

  async onMenuChange(menu) {
    await this.setState({
      selectedTab: menu.key
    });

    await this.loadSettings();
  }

  setVal(field: string, val: any) {
    this.dataChange[field] = val;
  }

  async loadSettings() {
    const { selectedTab } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = await settingService.all(selectedTab) as any;
      this.dataChange = {};
      this.setState({ list: resp.data });
      if (selectedTab === 'general') {
        const textEditorSettings = resp.data.filter((r) => r.type === 'text-editor');
        if (textEditorSettings && textEditorSettings.length > 0) {
          textEditorSettings.map((t) => {
            this[t.key] = t.value;
            return t;
          });
        }
      }
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err) || 'An error occurred, please try again!');
    } finally {
      this.setState({ loading: false });
    }
  }

  async submit() {
    try {
      await this.setState({ updating: true });
      // eslint-disable-next-line no-restricted-syntax
      for (const key of Object.keys(this.dataChange)) {
        // eslint-disable-next-line no-await-in-loop
        await settingService.update(key, this.dataChange[key]);
      }
      message.success('Updated setting successfully');
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err));
    } finally {
      this.setState({ updating: false });
    }
  }

  async verifyMailer() {
    try {
      this.setState({ updating: true });
      const resp = await settingService.verifyMailer();
      if (resp.data.hasError) {
        return message.error(JSON.stringify(resp.data.error || 'Could not verify this SMTP transporter'));
      }
      message.success('We\'ve sent an test email, please check your email inbox or spam folder');
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(err ? JSON.stringify(err) : 'Could not verify this SMTP transporter');
    } finally {
      this.setState({ updating: false });
    }
    return null;
  }

  renderUpload(setting: ISetting, ref: any) {
    if (!setting.meta || !setting.meta.upload) {
      return null;
    }
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <div style={{ padding: '10px 0' }} key={`upload${setting._id}`}>
        <ImageUpload
          image={setting.value}
          uploadUrl={settingService.getFileUploadUrl()}
          headers={uploadHeaders}
          onUploaded={(resp) => {
            const formInstance = this.formRef.current as FormInstance;
            // eslint-disable-next-line no-param-reassign
            ref.current.input.value = resp.response.data.url;
            formInstance.setFieldsValue({
              [setting.key]: resp.response.data.url
            });
            this.dataChange[setting.key] = resp.response.data.url;
          }}
        />
      </div>
    );
  }

  renderFormItem(setting: ISetting) {
    let { type } = setting;
    if (setting.meta && setting.meta.textarea) {
      type = 'textarea';
    }
    const ref = createRef() as any;
    switch (type) {
      case 'textarea':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description || null}>
            <Input.TextArea defaultValue={setting.value} onChange={(val) => this.setVal(setting.key, val.target.value)} />
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description || null}>
            <InputNumber
              style={{ width: '100%' }}
              defaultValue={setting.value}
              onChange={(val) => this.setVal(setting.key, val)}
            />
          </Form.Item>
        );
      case 'text-editor':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description || null}>
            <WYSIWYG onChange={this.handleTextEditerContentChange.bind(this, setting.key)} html={this[setting.key]} />
          </Form.Item>
        );
      case 'boolean':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description || null}>
            <Switch defaultChecked={setting.value} onChange={(val) => this.setVal(setting.key, val)} />
          </Form.Item>
        );
      case 'post':
        return (
          <Form.Item
            label={setting.name}
            key={setting._id}
            help={setting.description}
          >
            <SelectPostDropdown
              defaultValue={setting.value}
              onSelect={(val) => this.setVal(setting.key, val)}
            />
          </Form.Item>
        );
      case 'radio':
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description}>
            <Radio.Group onChange={(val) => this.setVal(setting.key, val.target.value)} defaultValue={setting.value}>
              {setting.meta?.value.map((v: any) => (
                <Radio value={v.key} key={v.key}>
                  {v.name}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );
      default:
        return (
          <Form.Item label={setting.name} key={setting._id} help={setting.description || null}>
            <Input
              defaultValue={setting.value}
              ref={ref}
              key={`input${setting._id}`}
              onChange={(val) => this.setVal(setting.key, val.target.value)}
            />
            {this.renderUpload(setting, ref)}
          </Form.Item>
        );
    }
  }

  render() {
    const {
      updating, selectedTab, list, loading
    } = this.state;
    const layout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    };

    const initialValues = {} as any;
    list.forEach((item: ISetting) => {
      initialValues[item.key] = item.value;
    });
    return (
      <>
        <Head>
          <title>Site Settings</title>
        </Head>
        <Page>
          <div style={{ marginBottom: '20px' }}>
            <Menu onClick={this.onMenuChange.bind(this)} selectedKeys={[selectedTab]} mode="horizontal">
              <Menu.Item key="general">General</Menu.Item>
              <Menu.Item key="pageContent">Custom content</Menu.Item>
              <Menu.Item key="links">Links</Menu.Item>
              <Menu.Item key="email">Email</Menu.Item>
              <Menu.Item key="custom">SEO</Menu.Item>
              <Menu.Item key="ccbill">CCbill</Menu.Item>
              <Menu.Item key="currency">Currency</Menu.Item>
              <Menu.Item key="smtp">SMTP</Menu.Item>
              <Menu.Item key="s3">S3</Menu.Item>
              <Menu.Item key="analytics">Google Analytics</Menu.Item>
            </Menu>
          </div>
          {loading ? (
            <Loader spinning />
          ) : (
            <Form
              {...layout}
              layout={selectedTab === 'commission' ? 'vertical' : 'horizontal'}
              name="setting-frm"
              onFinish={this.submit.bind(this)}
              initialValues={initialValues}
              ref={this.formRef}
            >
              {list.map((setting) => this.renderFormItem(setting))}
              {selectedTab === 'smtp' && (
                <Form.Item>
                  <Button disabled={updating} loading={updating} onClick={this.verifyMailer.bind(this)} type="link">
                    Once saved, click here to verify SMTP then start using.
                  </Button>
                </Form.Item>
              )}
              <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
                <Button type="primary" htmlType="submit" disabled={updating} loading={updating}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          )}
        </Page>
      </>
    );
  }
}

export default Settings;
