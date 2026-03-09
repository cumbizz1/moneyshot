import { } from '@ant-design/icons';
import { Button } from 'antd';
import { PureComponent } from 'react';
import { IVideo } from 'src/interfaces/index';

interface IProps {
  video: IVideo;
  onFinish: Function;
  submiting: boolean;
  currencySymbol: string;
}

export class PurchaseVideoForm extends PureComponent<IProps> {
  render() {
    const {
      onFinish, submiting = false, video, currencySymbol
    } = this.props;
    return (
      <div className="text-center">
        <div style={{ margin: '20px 0' }} />
        <Button type="primary" loading={submiting} disabled={submiting} onClick={onFinish.bind(this)}>
          Unlock video by
          {' '}
          {currencySymbol}
          {video.price.toFixed(2)}
        </Button>
      </div>
    );
  }
}
