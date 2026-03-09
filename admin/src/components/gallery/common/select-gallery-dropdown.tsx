/* eslint-disable react/require-default-props */
import { galleryService } from '@services/gallery.service';
import { message, Select } from 'antd';
import { debounce } from 'lodash';
import React, { PureComponent } from 'react';

interface IProps {
  style?: Record<string, string>;
  onSelect: Function;
  defaultValue?: string;
  disabled?: boolean;
  isMultiple?: boolean;
}

export class SelectGalleryDropdown extends PureComponent<IProps> {
  state = {
    loading: false,
    data: [] as any
  };

  loadGalleries = debounce(async (q) => {
    try {
      await this.setState({ loading: true });
      const resp = await (await galleryService.search({ q, limit: 500 })).data;
      this.setState({
        data: resp.data,
        loading: false
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
      this.setState({ loading: false });
    }
  }, 500);

  async componentDidMount() {
    try {
      await this.setState({ loading: true });
      const resp = await (await galleryService.search({ q: '', limit: 500 })).data;
      this.setState({
        data: resp.data,
        loading: false
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
      this.setState({ loading: false });
    }
  }

  render() {
    const {
      style, onSelect, defaultValue, disabled, isMultiple
    } = this.props;
    const { data, loading } = this.state;
    return (
      <Select
        showSearch
        defaultValue={defaultValue || ''}
        placeholder="Type to search gallery here"
        style={style}
        onSearch={this.loadGalleries.bind(this)}
        onChange={(val) => onSelect(val)}
        loading={loading}
        optionFilterProp="children"
        disabled={disabled}
        mode={isMultiple ? 'multiple' : null}
      >
        {data && data.length > 0 && data.map((u) => (
          <Select.Option value={u._id} key={u._id} style={{ textTransform: 'capitalize' }}>
            {`${u.name}`}
          </Select.Option>
        ))}
      </Select>
    );
  }
}
