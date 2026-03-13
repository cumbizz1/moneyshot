/* eslint-disable react/require-default-props */
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { AccountForm } from '@components/performer/AccountForm';
import { performerService } from '@services/index';
import { utilsService } from '@services/utils.service';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import {
  IBody,
  ICountry,
  ILangguges,
  IPerformer,
  IPhoneCodes
} from 'src/interfaces';

interface IProps {
  id: string;
  countries?: ICountry[];
  languages?: ILangguges[];
  phoneCodes?: IPhoneCodes[];
  bodyInfo?: IBody;
}
class PerformerUpdate extends PureComponent<IProps> {
  static async getInitialProps(ctx: NextPageContext) {
    try {
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
        bodyInfo: bodyInfo?.data || null,
        ...ctx.query
      };
    } catch (e) {
      return {
        countries: [],
        languages: [],
        phoneCodes: [],
        heights: [],
        weights: [],
        ...ctx.query
      };
    }
  }

  state = {
    updating: false,
    fetching: false,
    performer: {} as IPerformer,
    avatarUrl: '',
    coverUrl: ''
  };

  customFields = {};

  async componentDidMount() {
    const { id } = this.props;
    try {
      await this.setState({ fetching: true });
      const resp = await (await performerService.findById(id)).data as IPerformer;
      this.setState({ performer: resp });
      resp.avatar && this.setState({ avatarUrl: resp.avatar });
      resp.cover && this.setState({ coverUrl: resp.cover });
    } catch (e) {
      message.error('Error while fecting performer!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  onUploaded(field: string, resp: any) {
    if (field === 'avatarId') {
      this.setState({ avatarUrl: resp.response.data.url });
    }
    if (field === 'coverId') {
      this.setState({ coverUrl: resp.response.data.url });
    }
    this.customFields[field] = resp.response.data._id;
  }

  async submit(data: any) {
    const { id } = this.props;
    const { performer } = this.state;
    try {
      this.setState({ updating: true });
      await performerService.update(id, {
        ...performer,
        ...data,
        ...this.customFields
      });
      message.success('Updated successfully');
      Router.back();
    } catch (e) {
      const error = await e;
      message.error(error?.message || 'An error occurred, please try again!');
      this.setState({ updating: false });
    }
  }

  render() {
    const {
      performer, updating, fetching, avatarUrl, coverUrl
    } = this.state;
    const {
      countries, languages, bodyInfo, phoneCodes = []
    } = this.props;
    return (
      <>
        <Head>
          <title>
            {`${performer?.name || performer?.username || ''}`}
            {' '}
            update
          </title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Models', href: '/model' },
            { title: performer?.name || performer?.username || '' },
            { title: 'Update' }
          ]}
        />
        <Page>
          {!fetching && performer && (
          <AccountForm
            onUploaded={this.onUploaded.bind(this)}
            onFinish={this.submit.bind(this)}
            performer={performer}
            submiting={updating}
            countries={countries}
            languages={languages}
            bodyInfo={bodyInfo}
            avatarUrl={avatarUrl}
            coverUrl={coverUrl}
            phoneCodes={phoneCodes}
          />
          )}
        </Page>
      </>
    );
  }
}

export default PerformerUpdate;
