import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { FormProduct } from '@components/product/form-product';
import { productService } from '@services/product.service';
import { message } from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';

interface IFiles {
  fieldname: string;
  file: File;
}

class CreateProduct extends PureComponent {
  state = {
    uploading: false,
    uploadPercentage: 0
  };

  _files: {
    digitalFile: File;
  } = {
      digitalFile: null
    };

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  async submit(data: any) {
    if (data.type === 'digital' && !this._files.digitalFile) {
      message.error('Please select digital file!');
      return;
    }
    if (data.type === 'physical') {
      this._files.digitalFile = null;
    }
    const files = Object.keys(this._files).reduce((file, key) => {
      if (this._files[key]) {
        file.push({
          fieldname: key,
          file: this._files[key] || null
        });
      }
      return file;
    }, [] as IFiles[]) as [IFiles];
    await this.setState({
      uploading: true
    });
    const submitData = data;
    if (!submitData.categoryIds || !submitData.categoryIds.length) delete submitData.categoryIds;
    if (!submitData.imageIds || !submitData.imageIds.length) delete submitData.imageIds;
    try {
      await productService.create(
        files,
        submitData,
        this.onUploading.bind(this)
      );
      message.success('Created success');
      Router.push('/product');
    } catch (error) {
      message.error('An error occurred, please try again!');
      this.setState({ uploading: false });
    }
  }

  render() {
    const { uploading, uploadPercentage } = this.state;
    return (
      <>
        <Head>
          <title>Create product</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Product', href: '/product' },
            { title: 'Create new product' }
          ]}
        />
        <Page>
          <FormProduct
            submit={this.submit.bind(this)}
            beforeUpload={this.beforeUpload.bind(this)}
            uploading={uploading}
            uploadPercentage={uploadPercentage}
          />
        </Page>
      </>
    );
  }
}

export default CreateProduct;
