import { cookieService } from '@services/cookies.service';
import Link from 'next/link';
import Router, { withRouter } from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { IUIConfig, IUser } from 'src/interfaces';

import style from './footer.module.less';

interface IProps {
  currentUser: IUser;
  ui: IUIConfig;
  router: any;
}
class Footer extends PureComponent<IProps, any> {
  componentDidMount() {
    this.checkAdult();
  }

  componentDidUpdate(prevProps) {
    const { router } = this.props;
    if (prevProps?.router?.asPath !== router.asPath) {
      this.checkAdult();
    }
  }

  checkAdult() {
    const confirmAdult = cookieService.checkCookie('confirm_adult');
    !confirmAdult && Router.replace('/');
  }

  render() {
    const { router } = this.props;
    const { ui, currentUser } = this.props;
    const menus = ui.menus && ui.menus.length > 0
      ? ui.menus.filter((m) => m.section === 'footer')
      : [];
    return (
      <div className={style['main-footer']}>
        <div className="main-container">
          {!currentUser._id && (
            <ul key="auth-links">
              <li className={router.pathname === '/auth/register' ? 'active' : ''}>
                <Link href={{ pathname: '/auth/register' }} as="/auth/register">
                  <a>Sign up</a>
                </Link>
              </li>
              <li className={router.pathname === '/auth/login' ? 'active' : ''}>
                <Link href="/auth/login">
                  <a>Log in</a>
                </Link>
              </li>
            </ul>
          )}
          <ul key="menus">
            {menus?.map((item) => (
              <li key={item._id} className={router.pathname === item.path ? 'active' : ''}>
                <a rel="noreferrer" href={item.path} target={item.isNewTab ? '_blank' : ''}>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
          {/* eslint-disable-next-line react/no-danger */}
          {ui.footerContent ? <div key="footer-content" className="footer-content" dangerouslySetInnerHTML={{ __html: ui.footerContent }} />
            : (
              <div className="copyright-text">
                <span>
                  <Link href="/home">
                    <a>{ui?.siteName}</a>
                  </Link>
                  {' '}
                  © Copyright
                  {' '}
                  {new Date().getFullYear()}
                </span>
              </div>
            )}
        </div>
      </div>
    );
  }
}
const mapState = (state: any) => ({
  currentUser: state.user.current,
  ui: state.ui
});
export default withRouter(connect(mapState)(Footer)) as any;
