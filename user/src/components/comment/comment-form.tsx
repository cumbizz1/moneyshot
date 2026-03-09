import {
  SendOutlined, SmileOutlined
} from '@ant-design/icons';
import {
  Button, Form, Input, message, Popover
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import dynamic from 'next/dynamic';
import { createRef, PureComponent } from 'react';
import { IUser } from 'src/interfaces';

import { IComment } from '../../interfaces/comment';
import style from './comment.module.less';

const Emotions = dynamic(() => import('@components/common/emotions'), {
  ssr: false
});

interface IProps {
  objectId: string;
  // eslint-disable-next-line react/require-default-props
  objectType?: string;
  onSubmit: Function;
  creator: IUser;
  // eslint-disable-next-line react/require-default-props
  requesting?: boolean;
  // eslint-disable-next-line react/require-default-props
  isReply?: boolean;
}

const { TextArea } = Input;

export class CommentForm extends PureComponent<IProps> {
  formRef: any;

  state = {
    text: ''
  };

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  onFinish(values: IComment) {
    const {
      onSubmit: handleComment, objectId, objectType, creator
    } = this.props;
    const data = values;
    if (!creator || !creator._id) {
      return message.error('Please login!');
    }
    if (!data.content) {
      return message.error('Please add content');
    }
    if (data.content.length > 150) {
      return message.error('Please comment under 150 characters');
    }
    data.objectId = objectId;
    data.objectType = objectType || 'video';
    this.formRef.current.resetFields();
    return handleComment(data);
  }

  async onEmojiClick(emoji) {
    const { text } = this.state;
    const { creator, requesting } = this.props;
    if (!emoji || !creator || requesting) return;
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      content: `${instance.getFieldValue('content')} ${emoji} `
    });
    this.setState({ text: `${text} ${emoji} ` });
  }

  render() {
    const {
      creator, requesting, isReply
    } = this.props;
    if (!this.formRef) this.formRef = createRef();
    return (
      <Form
        ref={this.formRef}
        name="comment-form"
        onFinish={this.onFinish.bind(this)}
        initialValues={{
          content: ''
        }}
      >
        <div className={style['comment-form']}>
          <div className="cmt-user">
            <img alt="creator-img" src={creator && creator.avatar ? creator.avatar : '/no-avatar.png'} />
          </div>
          <div className="cmt-area">
            <Form.Item
              name="content"
            >
              <TextArea showCount maxLength={150} disabled={!creator || !creator._id} rows={!isReply ? 2 : 1} placeholder={!isReply ? 'Add a comment here' : 'Add a reply here'} />
            </Form.Item>
            <Popover content={<Emotions onEmojiClick={this.onEmojiClick.bind(this)} />} trigger="click">
              <div className="grp-emotions">
                <SmileOutlined />
              </div>
            </Popover>
          </div>
          <Button className={!isReply ? 'submit-btn' : ''} htmlType="submit" disabled={requesting || !creator || !creator._id}>
            {!isReply ? <SendOutlined /> : 'Reply'}
          </Button>
        </div>
      </Form>
    );
  }
}
