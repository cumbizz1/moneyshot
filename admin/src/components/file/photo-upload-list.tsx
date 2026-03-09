import './index.module.less';

import { DeleteOutlined } from '@ant-design/icons';
import { Image, Progress, Spin } from 'antd';

interface IProps {
  remove: Function;
  files: any[];
  setCover?: Function;
}

export function PhotoUploadList({
  files, remove, setCover
}: IProps) {
  return (
    <div className="ant-upload-list ant-upload-list-picture photo-upload-list">
      {files.map((file) => (
        <div className="ant-upload-list-item ant-upload-list-item-uploading ant-upload-list-item-list-type-picture" key={file.uid || file._id}>
          <div className="ant-upload-list-item-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
              <span className="ant-upload-list-item-thumbnail">
                {file.status !== 'uploading' ? <Image src={file?.photo?.thumbnails[0] || file?.photo?.url} /> : <Spin size="small" />}
              </span>
              <span className="ant-upload-list-item-name ant-upload-list-item-name-icon-count-1">
                <span><b>{file.name || file.title || 'N/A'}</b></span>
                {' '}
                |
                {' '}
                <span>
                  {((file.size || file?.photo?.size || 0) / (1024 * 1024)).toFixed(2)}
                  {' '}
                  MB
                </span>
              </span>
              {file.targetId && file.target === 'gallery' && (
              <span style={{ padding: '0 5px', whiteSpace: 'nowrap' }}>
                {file.isCover ? (
                  <span className="ant-upload-list-item-card-actions picture">
                    <a>
                      Cover IMG
                    </a>
                  </span>
                ) : (
                  <span className="ant-upload-list-item-card-actions picture">
                    <a aria-hidden onClick={() => setCover && setCover(file)}>
                      Set as cover IMG
                    </a>
                  </span>
                )}
              </span>
              )}
              <span style={{ padding: '0 5px' }}>
                <a aria-hidden onClick={remove.bind(this, file)}>
                  <DeleteOutlined />
                </a>
              </span>
            </div>
            {file.percent && <Progress percent={Math.round(file.percent)} />}
          </div>
        </div>
      ))}
    </div>
  );
}

PhotoUploadList.defaultProps = {
  setCover() {}
};

export default PhotoUploadList;
