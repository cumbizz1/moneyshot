import { userService } from '@services/index';
import { PureComponent } from 'react';

import AuthLayout from './auth-layout';
import BlankLayout from './blank-layout';
import GEOLayout from './geoBlocked-layout';
import MaintenaceLayout from './maintenance-layout';
import PrimaryLayout from './primary-layout';
import PublicLayout from './public-layout';

interface DefaultProps {
  children: any;
  layout: string;
  maintenance: boolean;
}

const LayoutMap = {
  geoBlock: GEOLayout,
  maintenance: MaintenaceLayout,
  primary: PrimaryLayout,
  public: PublicLayout,
  blank: BlankLayout,
  auth: AuthLayout
};

export default class BaseLayout extends PureComponent<DefaultProps> {
  state = {
    geoBlocked: false
  };

  componentDidMount() {
    this.checkBlockIp();
  }

  async checkBlockIp() {
    const checkBlock = await userService.checkCountryBlock();
    if (checkBlock?.data?.blocked) {
      this.setState({ geoBlocked: true });
    }
  }

  render() {
    const {
      children,
      layout,
      maintenance
    } = this.props;
    const { geoBlocked } = this.state;

    // eslint-disable-next-line no-nested-ternary
    const Container = maintenance ? LayoutMap.maintenance : geoBlocked ? LayoutMap.geoBlock : layout && LayoutMap[layout] ? LayoutMap[layout] : LayoutMap.primary;
    return (
      <Container>{children}</Container>
    );
  }
}
