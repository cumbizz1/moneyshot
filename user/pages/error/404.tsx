import { Alert, Layout } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

interface IProps {
  system: any;
}

class Error404Page extends PureComponent<IProps> {
  static noredirect: boolean = true;

  render() {
    const { system } = this.props;
    const error = system.error || {
      statusCode: 404,
      message: 'Your requested link does not exist!'
    };
    return (
      <>
        <Head>
          <title>Not Found Error</title>
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

export default connect(mapStates)(Error404Page);
