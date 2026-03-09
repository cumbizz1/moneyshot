/* eslint-disable react/require-default-props */
import { performerService } from '@services/performer.service';
import { message, Select } from 'antd';
import { debounce } from 'lodash';
import { PureComponent } from 'react';

interface IProps {
  style?: Record<string, string>;
  onSelect: Function;
  defaultValue?: string |string[];
  disabled?: boolean;
  isMultiple?: boolean;
  noEmtpy?: boolean;
}

export class SelectPerformerDropdown extends PureComponent<IProps> {
  state = {
    loading: false,
    data: [] as any,
    firsLoadDone: false
  };

  loadPerformers = debounce(async (q) => {
    try {
      await this.setState({ loading: true });
      const resp = await (await performerService.search({ q, limit: 99 })).data;
      this.setState({
        firsLoadDone: true,
        data: resp.data,
        loading: false
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured');
      this.setState({ loading: false, firsLoadDone: true });
    }
  }, 500);

  componentDidMount() {
    this.loadPerformers('');
  }

  render() {
    const {
      style, onSelect, defaultValue, disabled = false, isMultiple, noEmtpy
    } = this.props;
    const { data, loading, firsLoadDone } = this.state;
    return firsLoadDone && (
      <Select
        mode={isMultiple ? 'multiple' : null}
        showSearch
        defaultValue={defaultValue}
        placeholder="Type to search model here"
        style={style}
        onSearch={this.loadPerformers.bind(this)}
        onChange={(val) => onSelect(val)}
        loading={loading}
        optionFilterProp="children"
        disabled={disabled}
      >
        {!noEmtpy && (
        <Select.Option value="" key="all" style={{ textTransform: 'capitalize' }}>
          All model
        </Select.Option>
        )}
        {data && data.length > 0 && data.map((u) => (
          <Select.Option value={u._id} key={u._id} style={{ textTransform: 'capitalize' }}>
            {`${u?.name || u?.username || `${u?.firstName || ''} ${u?.lastNamme || ''}` || 'N/A'}`}
          </Select.Option>
        ))}
      </Select>
    );
  }
}
