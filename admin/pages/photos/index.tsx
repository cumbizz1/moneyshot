import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { SearchFilter } from '@components/common/search-filter';
import { TableListPhoto } from '@components/photo/table-list';
import { photoService } from '@services/photo.service';
import { message } from 'antd';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { PureComponent } from 'react';

interface IProps {
  galleryId: string;
}

class Photos extends PureComponent<IProps> {
  static async getInitialProps(ctx: NextPageContext) {
    return ctx.query;
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'updatedAt',
    sort: 'desc'
  };

  async componentDidMount() {
    const { galleryId } = this.props;
    const {
      filter
    } = this.state;

    if (galleryId) {
      await this.setState({
        filter: {
          ...filter,
          ...{
            galleryId: galleryId || ''
          }
        }
      });
    }
    this.search();
  }

  handleTableChange = async (pagination, filters, sorter) => {
    const pager = { ...pagination };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || 'updatedAt',
      sort: sorter.order && sorter.order === 'descend' ? 'desc' : 'asc'
    });
    this.search(pager.current);
  };

  async handleFilter(values) {
    const { filter } = this.state;
    await this.setState({ filter: { ...filter, ...values } });
    this.search();
  }

  async search(page = 1) {
    try {
      await this.setState({ searching: true });
      const {
        filter, limit, sort, pagination,
        sortBy
      } = this.state;
      const resp = await photoService.search({
        ...filter,
        limit,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  async deletePhoto(id: string) {
    const { pagination } = this.state;
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return false;
    }
    try {
      await photoService.delete(id);
      message.success('Deleted successfully');
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return undefined;
  }

  render() {
    const { galleryId } = this.props;
    const { list, searching, pagination } = this.state;
    const statuses = [
      {
        key: '',
        text: 'All statuses'
      },
      {
        key: 'active',
        text: 'Active'
      },
      {
        key: 'inactive',
        text: 'Inactive'
      }
    ];

    return (
      <>
        <Head>
          <title>Photos</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Photos' }]} />
        <Page>
          <SearchFilter
            statuses={statuses}
            onSubmit={this.handleFilter.bind(this)}
            searchWithGallery
            galleryId={galleryId || ''}
          />
          <div style={{ marginBottom: '20px' }} />
          <TableListPhoto
            dataSource={list}
            rowKey="_id"
            loading={searching}
            pagination={{ ...pagination, showSizeChanger: false }}
            onChange={this.handleTableChange.bind(this)}
            deletePhoto={this.deletePhoto.bind(this)}
          />
        </Page>
      </>
    );
  }
}

export default Photos;
