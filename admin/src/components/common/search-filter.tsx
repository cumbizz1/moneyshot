/* eslint-disable react/require-default-props */
import { SelectCategoryDropdown } from '@components/common/select-category-dropdown';
import { SelectPerformerDropdown } from '@components/common/select-performer-dropdown';
import { SelectGalleryDropdown } from '@components/gallery/common/select-gallery-dropdown';
import {
  Col, DatePicker,
  Input, Row, Select
} from 'antd';
import { PureComponent } from 'react';

const { RangePicker } = DatePicker;
interface IProps {
  keyword?: boolean;
  onSubmit?: Function;
  statuses?: {
    key: string;
    text?: string;
  }[];
  type?: {
    key: string;
    text?: string;
  }[];
  sourceType?: {
    key: string;
    text?: string;
  }[];
  searchWithPerformer?: boolean;
  performerId?: string;
  categoryId?: string;
  searchWithGallery?: boolean;
  searchWithCategory?: boolean;
  categoryGroup?: string;
  galleryId?: string;
  isSchedule?: boolean;
  dateRange?: boolean;
}

export class SearchFilter extends PureComponent<IProps> {
  timeout: any;

  onSearchByKeyword = (q) => {
    const { onSubmit } = this.props;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.setState({ q }, () => onSubmit(this.state));
    }, 500);
  };

  render() {
    const {
      onSubmit,
      statuses = [],
      searchWithCategory,
      searchWithPerformer,
      performerId,
      galleryId,
      searchWithGallery,
      dateRange,
      sourceType,
      keyword,
      isSchedule,
      type,
      categoryGroup,
      categoryId
    } = this.props;
    return (
      <Row gutter={24}>
        {keyword && (
          <Col lg={6} md={8} xs={12}>
            <Input
              placeholder="Enter keyword"
              onChange={(evt) => this.onSearchByKeyword(evt.target.value)}
              onPressEnter={() => onSubmit(this.state)}
            />
          </Col>
        )}
        {statuses && statuses.length > 0 && (
          <Col lg={6} md={8} xs={12}>
            <Select
              onChange={(val) => {
                this.setState({ status: val }, () => onSubmit(this.state));
              }}
              style={{ width: '100%' }}
              placeholder="Select status"
              defaultValue=""
            >
              {statuses.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
        {isSchedule && (
          <Col lg={6} md={8} xs={12}>
            <Select
              onChange={(val) => {
                this.setState({ isSchedule: val }, () => onSubmit(this.state));
              }}
              style={{ width: '100%' }}
              placeholder="Select type"
              defaultValue=""
            >
              <Select.Option key="all" value="">
                All type
              </Select.Option>
              <Select.Option key="upcoming" value="true">
                Upcoming
              </Select.Option>
              <Select.Option key="recent" value="false">
                Recent
              </Select.Option>
            </Select>
          </Col>
        )}
        {type && type.length > 0 && (
          <Col lg={6} md={8} xs={12}>
            <Select
              onChange={(val) => {
                this.setState({ type: val }, () => onSubmit(this.state));
              }}
              style={{ width: '100%' }}
              placeholder="Select type"
              defaultValue=""
            >
              {type.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
        {sourceType && sourceType.length > 0 && (
          <Col lg={6} md={8} xs={12}>
            <Select
              onChange={(val) => {
                this.setState({ sourceType: val }, () => onSubmit(this.state));
              }}
              style={{ width: '100%' }}
              placeholder="Select type"
              defaultValue=""
            >
              {sourceType.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
        {searchWithCategory && (
          <Col lg={6} md={8} xs={12}>
            <SelectCategoryDropdown
              group={categoryGroup || ''}
              isMultiple={false}
              style={{ width: '100%' }}
              defaultValue={categoryId || ''}
              onSelect={(val) => this.setState({ categoryId: val || '' }, () => onSubmit(this.state))}
            />
          </Col>
        )}
        {searchWithPerformer && (
          <Col lg={6} md={8} xs={12}>
            <SelectPerformerDropdown
              style={{ width: '100%' }}
              onSelect={(val) => this.setState({ performerId: val || '' }, () => onSubmit(this.state))}
              defaultValue={performerId || ''}
            />
          </Col>
        )}
        {searchWithGallery && (
          <Col lg={6} md={8} xs={12}>
            <SelectGalleryDropdown
              style={{ width: '100%' }}
              onSelect={(val) => this.setState({ targetId: val || '' }, () => onSubmit(this.state))}
              defaultValue={galleryId || ''}
            />
          </Col>
        )}
        {dateRange && (
          <Col lg={6} md={8} xs={12}>
            <RangePicker
              onChange={(dates: [any, any], dateStrings: [string, string]) => this.setState({ fromDate: dateStrings[0], toDate: dateStrings[1] }, () => onSubmit(this.state))}
            />
          </Col>
        )}
      </Row>
    );
  }
}
