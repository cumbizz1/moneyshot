import { settingService } from '@services/setting.service';
import Document, {
  Head, Html, Main, NextScript
} from 'next/document';

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const resp = await settingService.all();
    const settings = resp.data;
    return {
      ...initialProps,
      headerScript: settings.headerScript,
      afterBodyScript: settings.afterBodyScript,
      favicon: settings.favicon
    };
  }

  render() {
    const { afterBodyScript, headerScript, favicon } = this.props as any;
    return (
      <Html>
        <Head>
          <link rel="icon" href={favicon || '/favicon.ico'} sizes="64x64" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
          <meta charSet="utf-8" />
        </Head>
        <body>
          {headerScript && (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: headerScript }} />
          )}
          <Main />
          <NextScript />
          {afterBodyScript && (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: afterBodyScript }} />
          )}
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
