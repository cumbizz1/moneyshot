import './primary-layout.module.less';

import { Layout } from 'antd';
import dynamic from 'next/dynamic';
import { Router as RouterEvent } from 'next/router';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig } from 'src/interfaces/ui-config';

const Loader = dynamic(() => import('@components/common/base/loader'));

interface DefaultProps extends IUIConfig {
  children: any;
}
interface IState{
  routerChange:boolean;
}

export async function getStaticProps() {
  return {
    props: {}
  };
}

class BlankLayout extends PureComponent<DefaultProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      routerChange: false
    };
  }

  componentDidMount() {
    this.handleStateChange();
  }

  handleStateChange() {
    RouterEvent.events.on('routeChangeStart', async () => this.setState({ routerChange: true }));
    RouterEvent.events.on('routeChangeComplete', async () => this.setState({ routerChange: false }));
  }

  render() {
    const {
      children
    } = this.props;
    const {
      routerChange
    } = this.state;

    return (
      <Layout>
        <div className="container" id="primaryLayout">
          <div className="content">
            {routerChange && <Loader />}
            {children}
          </div>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ...state.ui
});
const mapDispatchToProps = { };

export default connect(mapStateToProps, mapDispatchToProps)(BlankLayout);
