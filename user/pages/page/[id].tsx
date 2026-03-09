import { ReadOutlined } from '@ant-design/icons';
import { IPostResponse } from '@interfaces/post';
import { postService } from '@services/post.service';
import { Layout } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

interface IProps {
  post: IPostResponse;
}
class PostDetail extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  static async getInitialProps(ctx) {
    const { query } = ctx;
    try {
      const post = await (await postService.findById(query.id)).data;
      return { post };
    } catch (e) {
      return Router.replace('/404');
    }
  }

  render() {
    const { post } = this.props;
    return (
      <Layout>
        <Head>
          <title>
            {post?.title || ''}
          </title>
        </Head>
        <div className="main-container">
          <h3 className="page-heading">
            <span className="box">
              <ReadOutlined />
              {' '}
              {post?.title || ''}
            </span>
          </h3>
          <div
            className="page-content"
              // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: post?.content }}
          />
        </div>
      </Layout>
    );
  }
}

export default PostDetail;
