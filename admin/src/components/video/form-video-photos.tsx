/* eslint-disable no-restricted-syntax */
import { UploadOutlined } from '@ant-design/icons';
import UploadList from '@components/file/photo-upload-list';
import { getGlobalConfig } from '@services/config';
import { photoService } from '@services/photo.service';
import {
  Divider,
  message, Upload
} from 'antd';
import { PureComponent } from 'react';

const { Dragger } = Upload;

interface IProps {
  targetId: string;
}

export class BulkUploadPhotoForm extends PureComponent<IProps> {
  state = {
    uploading: false,
    fileList: [],
    fileIds: [],
    total: 0
  };

  componentDidMount() {
    this.handleLoadPhotos();
  }

  async handleLoadPhotos() {
    const { targetId } = this.props;
    try {
      const resp = await (await photoService.search({ limit: 200, targetId })).data;
      this.setState({
        fileList: resp.data,
        fileIds: resp.data.map((f) => f._id),
        total: resp.total
      });
    } catch (e) {
      message.error('Error on load photos');
    }
  }

  onUploading(file, resp: any) {
    const data = file;
    data.percent = resp.percentage;
    if (file.percent === 100) data.status = 'done';
    this.forceUpdate();
  }

  async beforeUpload(file, listFile) {
    const { fileIds } = this.state;
    const { targetId } = this.props;
    if (!listFile.length) {
      return;
    }
    const config = getGlobalConfig();
    if (file.size / 1024 / 1024 > (config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5)) {
      message.error(`${file.name} is over ${config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}MB`);
    }
    if (listFile.indexOf(file) === (listFile.length - 1)) {
      const files = listFile.filter((f) => f.size / 1024 / 1024 < (config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5));
      await this.setState({
        uploading: true
      });
      const newFileIds = [...fileIds];
      for (const newFile of files) {
        const _file = newFile as any;
        try {
          // eslint-disable-next-line no-continue
          if (['uploading'].includes(_file.status) || _file._id) continue;
          _file.status = 'uploading';
          // eslint-disable-next-line no-await-in-loop
          const resp = await photoService.uploadPhoto(
            _file,
            {
              target: 'video',
              targetId,
              name: _file.name,
              status: 'active'
            },
            this.onUploading.bind(this, newFile)
          ) as any;

          newFileIds.push(resp.data._id);
          _file._id = resp.data._id;
        } catch (e) {
          message.error(`File ${_file.name} error!`);
        }
      }
      this.setState({ uploading: false, fileIds: newFileIds, total: newFileIds.length });
    }
  }

  async remove(file) {
    const { fileList, fileIds } = this.state;
    try {
      await photoService.delete(file._id);
      this.setState({
        fileList: fileList.filter((f) => f._id !== file._id),
        fileIds: fileIds.filter((f) => f !== file._id)
      });
    } catch (e) {
      message.error(`Delete file ${file.name || file.title} error`);
    }
  }

  render() {
    const { uploading, fileList, total } = this.state;
    const config = getGlobalConfig();
    return (
      <div>
        <Divider>
          {total}
          {' '}
          Photos
        </Divider>
        <Dragger
          accept="image/*"
          beforeUpload={this.beforeUpload.bind(this)}
          multiple
          showUploadList
          disabled={uploading}
          listType="picture"
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Click or drag files to this area to upload</p>
          <p className="ant-upload-hint">
            Photo must be
            {' '}
            {config.NEXT_PUBLIC_MAX_SIZE_IMAGE || 5}
            MB or below
          </p>
        </Dragger>
        <UploadList files={fileList} remove={this.remove.bind(this)} />
      </div>
    );
  }
}
