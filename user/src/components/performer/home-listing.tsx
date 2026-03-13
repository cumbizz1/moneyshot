import { CaretRightOutlined } from '@ant-design/icons';
import { Col, Row, Spin } from 'antd';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';

import PerformerCard from './card';
import style from './home-list-model.module.less';

interface IProps {
  performers: IPerformer[];
  loading: boolean;
}

export class HomePerformers extends PureComponent<IProps> {
  render() {
    const { performers = [], loading = false } = this.props;
    return (
      <div className={style.models}>
        <Row>
          {performers.length > 0 && performers.map((p: any) => (
            <Col xs={12} sm={12} md={6} lg={6} key={p._id}>
              <PerformerCard performer={p} />
            </Col>
          ))}
        </Row>
        {!loading && !performers.length && <div className="text-center" style={{ margin: '20px 0' }}>No model was found</div>}
        {loading && <div className="text-center"><Spin /></div>}
        {performers && performers.length > 8 && (
          <div className="show-all">
            <Link href="/model">
              <a>
                VIEW ALL MODELS
                {' '}
                <CaretRightOutlined />
              </a>
            </Link>
          </div>
        )}
      </div>
    );
  }
}
