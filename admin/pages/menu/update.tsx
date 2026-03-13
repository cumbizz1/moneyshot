import { BreadcrumbComponent } from '@components/common';
import Loader from '@components/common/base/loader';
import Page from '@components/common/layout/page';
import { FormMenu } from '@components/menu/form-menu';
import { menuService } from '@services/menu.service';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { IMenuUpdate } from 'src/interfaces';

interface IProps {
  id: string;
}
class MenuUpdate extends PureComponent<IProps> {
  state = {
    submiting: false,
    fetching: true,
    menu: {} as IMenuUpdate
  };

  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  async componentDidMount() {
    const { id } = this.props;
    try {
      const resp = await menuService.findById(id);
      this.setState({ menu: resp.data });
    } catch (e) {
      message.error('Menu not found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    const { id } = this.props;
    try {
      await this.setState({ submiting: true });
      const submitData = {
        ...data
      };
      await menuService.update(id, submitData);
      message.success('Updated successfully');
      Router.push('/menu');
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { menu, submiting, fetching } = this.state;
    return (
      <>
        <Head>
          <title>Update Menu</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Menu', href: '/menu' }, { title: menu.title ? menu.title : 'Detail menu' }]}
        />
        <Page>
          {fetching ? <Loader /> : <FormMenu menu={menu} onFinish={this.submit.bind(this)} submiting={submiting} />}
        </Page>
      </>
    );
  }
}

export default MenuUpdate;
