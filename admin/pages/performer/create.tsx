import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { AccountForm } from '@components/performer/AccountForm';
import { performerService, utilsService } from '@services/index';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import {
  IBody,
  ICountry, ILangguges, IPhoneCodes
} from 'src/interfaces';

interface IProps {
  countries: ICountry[];
  languages: ILangguges[];
  phoneCodes: IPhoneCodes[];
  bodyInfo: IBody;
}
class PerformerCreate extends PureComponent<IProps> {
  static async getInitialProps() {
    const [countries, languages, phoneCodes, bodyInfo] = await Promise.all([
      utilsService.countriesList(),
      utilsService.languagesList(),
      utilsService.phoneCodesList(),
      utilsService.bodyInfo()
    ]);
    return {
      countries: countries?.data || [],
      languages: languages?.data || [],
      phoneCodes: phoneCodes?.data || [],
      bodyInfo: bodyInfo?.data || null
    };
  }

  state = {
    creating: false
  };

  customFields = {};

  onUploaded(field: string, resp: any) {
    this.customFields[field] = resp.response.data._id;
  }

  async submit(data: any) {
    try {
      if (data.password !== data.rePassword) {
        message.error('Confirm password mismatch!');
        return;
      }
      await this.setState({ creating: true });
      const resp = await performerService.create({
        ...data,
        ...this.customFields
      });
      message.success('Created success');
      Router.replace({ pathname: '/performer/update', query: { id: resp.data._id } }, `/performer/update?id=${resp.data._id}`);
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'An error occurred, please try again!');
    } finally {
      this.setState({ creating: false });
    }
  }

  render() {
    const { creating } = this.state;
    const {
      countries, languages, bodyInfo, phoneCodes
    } = this.props;

    return (
      <>
        <Head>
          <title>New Performer</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Performers', href: '/performer' }, { title: 'New performer' }]}
        />
        <Page>
          <AccountForm
            onUploaded={this.onUploaded.bind(this)}
            onFinish={this.submit.bind(this)}
            submiting={creating}
            countries={countries}
            languages={languages}
            bodyInfo={bodyInfo}
            phoneCodes={phoneCodes}
          />
        </Page>
      </>
    );
  }
}

export default PerformerCreate;
