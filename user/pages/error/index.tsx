import { Alert, Layout } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

interface IProps {
  system: any;
}

class ErrorPage extends PureComponent<IProps> {
  static noredirect: boolean = true;

  render() {
    const { system } = this.props;
    const error = system.error || {
      statusCode: 400,
      message: 'Something went wrong, please try again later'
    };
    return (
      <>
        <Head>
          <title>Error</title>
        </Head>
        <Layout>
          <div className="main-container">
            <Alert
              style={{ marginTop: '20px' }}
              message={`${error.statusCode} Error`}
              description={error.message}
              type="error"
              showIcon
            />
          </div>
        </Layout>
      </>
    );
  }
}

const mapStates = (state: any) => ({
  system: state.system
});

export default connect(mapStates)(ErrorPage);
