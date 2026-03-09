import { SelectCategoryDropdown } from '@components/common/select-category-dropdown';
import {
  Col, Input, Row, Select
} from 'antd';
import React, { PureComponent } from 'react';

interface IProps {
  onSubmit: Function;
}

export class SearchFilter extends PureComponent<IProps> {
  state = {
    q: '',
    gender: '',
    status: ''
  };

  render() {
    const { onSubmit } = this.props;
    return (
      <Row gutter={24}>
        <Col lg={6} xs={12}>
          <Input
            placeholder="Enter keyword"
            onChange={(evt) => this.setState({ q: evt.target.value })}
            onPressEnter={() => onSubmit(this.state)}
          />
        </Col>
        <Col lg={6} xs={12}>
          <SelectCategoryDropdown
            group="performer"
            isMultiple={false}
            style={{ width: '100%' }}
            onSelect={(val) => this.setState({ categoryId: val || '' }, () => onSubmit(this.state))}
          />
        </Col>
        <Col lg={6} xs={12}>
          <Select
            defaultValue=""
            style={{ width: '100%' }}
            onChange={(status) => this.setState({ status }, () => onSubmit(this.state))}
          >
            <Select.Option value="">All status</Select.Option>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Col>
        <Col lg={6} xs={12}>
          <Select
            defaultValue=""
            style={{ width: '100%' }}
            onChange={(gender) => this.setState({ gender }, () => onSubmit(this.state))}
          >
            <Select.Option value="">All gender</Select.Option>
            <Select.Option key="male" value="male">
              Male
            </Select.Option>
            <Select.Option key="female" value="female">
              Female
            </Select.Option>
            <Select.Option key="transgender" value="transgender">
              Transgender
            </Select.Option>
          </Select>
        </Col>
      </Row>
    );
  }
}
