import moment from 'moment';
import Link from 'next/link';
import { PureComponent } from 'react';
import { IPerformer } from 'src/interfaces';

import style from './model-card.module.less';

interface IProps {
  performer: IPerformer;
}

export default class PerformerGridCard extends PureComponent<IProps> {
  render() {
    const { performer } = this.props;
    return (
      <Link
        href={{
          pathname: '/model/[id]',
          query: { id: performer?.username || performer?._id }
        }}
        as={`/model/${performer?.username || performer?._id}`}
      >
        <a>
          <div className={style['grid-card']} style={{ backgroundImage: `url(${performer?.avatar || '/no-avatar.png'})` }}>
            <div className="card-stat">
              <span>
                {moment().diff(moment(performer?.dateOfBirth), 'years') > 0 && `${moment().diff(moment(performer?.dateOfBirth), 'years')}+`}
              </span>
            </div>
            <div className="model-name">{performer?.name || performer?.username || 'N/A'}</div>
          </div>
        </a>
      </Link>
    );
  }
}
