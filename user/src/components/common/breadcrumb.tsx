/* eslint-disable react/no-array-index-key */
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';

interface IBreadcrum {
  title: string;
  href?: string;
}

interface IProps {
  breadcrumbs: IBreadcrum[];
}

export class BreadcrumbComponent extends PureComponent<IProps> {
  render() {
    const { breadcrumbs } = this.props;
    return (
      <div style={{ margin: '15px 0' }}>
        <Breadcrumb>
          <Breadcrumb.Item href="/home">
            <HomeOutlined />
          </Breadcrumb.Item>
          {breadcrumbs
            && breadcrumbs.length > 0
            && breadcrumbs.map((b, index) => (
              <Breadcrumb.Item key={index}>
                {b.href ? (
                  <Link href={b.href}>
                    <a>{b.title}</a>
                  </Link>
                ) : (
                  b.title
                )}
              </Breadcrumb.Item>
            ))}
        </Breadcrumb>
      </div>
    );
  }
}
