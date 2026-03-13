import '@components/performer/performer.module.less';

import { StarOutlined } from '@ant-design/icons';
import { PerformerAdvancedFilter } from '@components/common';
import PerformerCard from '@components/performer/card';
import {
  Col, Layout, message,
  Pagination, Row, Spin
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { IBody, ICountry } from 'src/interfaces';
import { performerService, utilsService } from 'src/services';

interface IProps {
  countries: ICountry[];
  bodyInfo: IBody
}

class Performers extends PureComponent<IProps> {
  static authenticate: boolean = true;

  static noredirect: boolean = true;

  static async getInitialProps() {
    const [countries, bodyInfo] = await Promise.all([
      utilsService.countriesList(),
      utilsService.bodyInfo()
    ]);
    return {
      countries: countries?.data || [],
      bodyInfo: bodyInfo?.data
    };
  }

  state = {
    offset: 0,
    limit: 12,
    filter: {
      sortBy: 'popular'
    } as any,
    performers: [],
    total: 0,
    fetching: true
  };

  componentDidMount() {
    this.getPerformers();
  }

  async handleFilter(values: any) {
    const { filter } = this.state;
    await this.setState({ offset: 0, filter: { ...filter, ...values } });
    this.getPerformers();
  }

  async getPerformers() {
    const {
      limit, offset, filter
    } = this.state;
    try {
      await this.setState({ fetching: true });
      const resp = await performerService.search({
        limit,
        offset: offset * limit,
        ...filter
      });
      this.setState({ performers: resp.data.data, total: resp.data.total, fetching: false });
    } catch {
      message.error('Error occured, please try again later');
      this.setState({ fetching: false });
    }
  }

  async pageChanged(page: number) {
    await this.setState({ offset: page - 1 });
    this.getPerformers();
  }

  render() {
    const {
      countries, bodyInfo
    } = this.props;
    const {
      limit, offset, performers, total, fetching
    } = this.state;

    return (
      <Layout>
        <Head>
          <title>Models</title>
        </Head>
        <div className="main-container">
          <h3 className="page-heading" style={{ justifyContent: 'flex-start' }}>
            <span className="box">
              <StarOutlined />
              {' '}
              Models
            </span>
            <span className="sub-box">
              {total}
            </span>
          </h3>
          <div className="md-below-heading">
            <PerformerAdvancedFilter
              onSubmit={this.handleFilter.bind(this)}
              countries={countries || []}
              bodyInfo={bodyInfo || null}
            />
          </div>
          <div className="main-background">
            <Row>
              {performers.length > 0
                && performers.map((p: any) => (
                  <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
                    <PerformerCard performer={p} />
                  </Col>
                ))}
            </Row>
            {!total && !fetching && <p className="text-center">No profile was found.</p>}
            {fetching && <div className="text-center"><Spin /></div>}
            {total && total > limit ? (
              <div className="paging">
                <Pagination
                  current={offset + 1}
                  total={total}
                  pageSize={limit}
                  onChange={this.pageChanged.bind(this)}
                  showSizeChanger={false}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Layout>
    );
  }
}

export default Performers;
