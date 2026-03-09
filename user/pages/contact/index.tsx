/* eslint-disable react/no-danger */
import {
  ContactsOutlined
} from '@ant-design/icons';
import storeHolder from '@lib/storeHolder';
import { postService } from '@services/post.service';
import { settingService } from '@services/setting.service';
import {
  Button, Col, Form, Input, Layout, message, Row
} from 'antd';
import Head from 'next/head';
import { createRef, PureComponent } from 'react';

import style from './contact.module.less';

const { TextArea } = Input;

interface IProps {
  contact: any;
}

class ContactPage extends PureComponent<IProps> {
  static authenticate = true;

  static noredirect: boolean = true;

  static async getInitialProps() {
    // postService.findById();
    const store = storeHolder.getStore();
    const { settings } = store.getState() as any;
    if (!settings.contactPageId) return {};

    const resp = await postService.findById(settings.contactPageId);
    return {
      contact: {
        content: resp.data?.content,
        title: resp.data?.title,
        image: resp.data?.image
      }
    };
  }

  _intervalCountdown: any;

  state = {
    submiting: false,
    countTime: 60
  };

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.countTime === 0) {
      this._intervalCountdown && clearInterval(this._intervalCountdown);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ countTime: 60 });
    }
  }

  componentWillUnmount() {
    this._intervalCountdown && clearInterval(this._intervalCountdown);
  }

  async onFinish(values) {
    this.setState({ submiting: true });
    try {
      await settingService.contact(values);
      message.success('Thank you for contacting us, we\'ll reply you within 48-hrs');
      this.handleCountdown();
      this.formRef.current.resetFields();
    } catch (e) {
      message.error('Error occured, please try again later');
    } finally {
      this.setState({ submiting: false });
    }
  }

  handleCountdown = async () => {
    const { countTime } = this.state;
    if (countTime === 0) {
      clearInterval(this._intervalCountdown);
      this.setState({ countTime: 60 });
      return;
    }
    this.setState({ countTime: countTime - 1 });
    this._intervalCountdown = setInterval(this.coundown.bind(this), 1000);
  };

  coundown() {
    const { countTime } = this.state;
    this.setState({ countTime: countTime - 1 });
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { contact } = this.props;
    const { submiting, countTime } = this.state;
    return (
      <Layout>
        <Head>
          <title>Contact</title>
        </Head>
        <div className="main-container">
          <h3 className="page-heading">
            <span className="box">
              <ContactsOutlined />
              {' '}
              Contact
            </span>
          </h3>
          <Row>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
            >
              <div className={style['contact-content']} dangerouslySetInnerHTML={{ __html: contact?.content }} />
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
            >
              <div className={style['contact-form']}>
                <p className="text-center">
                  Please fill out all the info beside and we will get back to
                  you with-in 48hrs.
                </p>
                <div className="form-message">
                  <Form
                    layout="vertical"
                    name="contact-from"
                    ref={this.formRef}
                    onFinish={this.onFinish.bind(this)}
                  >
                    <Form.Item
                      name="name"
                      rules={[{ required: true, message: 'Tell us your name' }]}
                    >
                      <Input placeholder="Your name" />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      rules={[
                        {
                          required: true,
                          message: 'Tell us your e-mail address.'
                        },
                        { type: 'email', message: 'Invalid email format' }
                      ]}
                    >
                      <Input placeholder="Your email address" />
                    </Form.Item>
                    <Form.Item
                      name="message"
                      rules={[
                        { required: true, message: 'What can we help you?' },
                        {
                          min: 20,
                          message: 'Please input at least 20 characters.'
                        }
                      ]}
                    >
                      <TextArea style={{ minHeight: 65 }} minLength={20} maxLength={250} showCount rows={3} placeholder="Your message" />
                    </Form.Item>
                    <div className="text-center">
                      <Button
                        size="large"
                        className="primary"
                        type="primary"
                        htmlType="submit"
                        loading={submiting || countTime < 60}
                        disabled={submiting || countTime < 60}
                        style={{ fontWeight: 600, width: '100%' }}
                      >
                        {countTime < 60 ? 'Resend in' : 'Send'}
                        {' '}
                        {countTime < 60 && `${countTime}s`}
                      </Button>
                    </div>
                  </Form>

                </div>

              </div>
            </Col>
          </Row>
        </div>
      </Layout>
    );
  }
}

export default ContactPage;
