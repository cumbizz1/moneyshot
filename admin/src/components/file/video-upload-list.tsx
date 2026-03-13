import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Progress } from 'antd';
import { PureComponent } from 'react';

interface IProps {
  remove: Function;
  files: any[];
}

export default class VideoUploadList extends PureComponent<IProps> {
  render() {
    const { files, remove } = this.props;
    return (
      <div className="ant-upload-list ant-upload-list-picture">
        {files.map((file) => (
          <div className="ant-upload-list-item ant-upload-list-item-list-type-picture" key={file.uid}>
            <div className="ant-upload-list-item-info">
              <div className="upload-vid-item">
                <span className="vid-thumb">
                  <PlayCircleOutlined />
                </span>
                <span className="vid-name">
                  <b>{`${file.name} | ${(file.size / (1024 * 1024)).toFixed(2)}Mb`}</b>
                </span>
                {file.percent !== 100
                  && (
                    <a className="delete-btn" aria-hidden onClick={() => remove(file)}>
                      <DeleteOutlined />
                    </a>
                  )}
              </div>
              {file.percent && <Progress percent={Math.round(file.percent)} />}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
