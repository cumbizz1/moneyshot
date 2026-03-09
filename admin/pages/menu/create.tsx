import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { FormMenu } from '@components/menu/form-menu';
import { menuService } from '@services/menu.service';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

class MenuCreate extends PureComponent {
  state = {
    submiting: false
  };

  async submit(data: any) {
    try {
      await this.setState({ submiting: true });
      const submitData = {
        ...data
      };
      await menuService.create(submitData);
      message.success('Created successfully');
      // TODO - redirect
      Router.push('/menu');
    } catch (e) {
      // TODO - check and show error here
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'Something went wrong, please try again!');
      this.setState({ submiting: false });
    }
  }

  render() {
    const { submiting } = this.state;
    return (
      <>
        <Head>
          <title>New menu</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Menus', href: '/menu' }, { title: 'New menu' }]} />
        <Page>
          <FormMenu onFinish={this.submit.bind(this)} submiting={submiting} />
        </Page>
      </>
    );
  }
}

export default MenuCreate;
