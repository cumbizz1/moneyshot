import { FormCategory } from '@components/category/form';
import { BreadcrumbComponent } from '@components/common';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { categoryService } from '@services/category.service';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { ICategory } from 'src/interfaces';

interface IProps {
  id: string;
}
class categoryUpdate extends PureComponent<IProps> {
  state = {
    submiting: false,
    fetching: true,
    category: {} as ICategory
  };

  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  async componentDidMount() {
    const { id } = this.props;
    try {
      this.setState({ fetching: true });
      const resp = await categoryService.findById(id);
      this.setState({ category: resp.data });
    } catch (e) {
      message.error('category not found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    const { id } = this.props;
    try {
      this.setState({ submiting: true });
      await categoryService.update(id, data);
      message.success('Updated successfully');
      Router.push('/categories');
    } catch (e) {
      message.error('Something went wrong, please try again!');
    } finally {
      this.setState({ submiting: false });
    }
  }

  render() {
    const { category, submiting, fetching } = this.state;
    return (
      <>
        <Head>
          <title>Update Category</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Categories', href: '/categories' },
            { title: 'Update' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <FormCategory category={category} onFinish={this.submit.bind(this)} submiting={submiting} />
          )}
        </Page>
      </>
    );
  }
}

export default categoryUpdate;
