import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { IBody, ICountry } from '@interfaces/index';
import {
  Button, Input, Select
} from 'antd';
import { omit } from 'lodash';
import { PureComponent } from 'react';

import { SelectCategoryDropdown } from './select-category-dropdown';

interface IProps {
  onSubmit: Function;
  countries: ICountry[];
  bodyInfo: IBody;
}

export class PerformerAdvancedFilter extends PureComponent<IProps> {
  state = {
    showMore: false
  };

  handleSubmit() {
    const { onSubmit } = this.props;
    onSubmit(omit(this.state, ['showMore']));
  }

  render() {
    const { countries, bodyInfo } = this.props;
    const { showMore } = this.state;
    const {
      heights = [], weights = [], bodyTypes = [], genders = [], sexualOrientations = [], ethnicities = [],
      ages = [], hairs = [], pubicHairs = [], eyes = [], butts = []
    } = bodyInfo as any;
    return (
      <div style={{ width: '100%' }}>
        <div className="filter-block">
          <div className="filter-item">
            <Input
              style={{ width: '100%' }}
              placeholder="Enter keyword"
              onChange={(evt) => this.setState({ q: evt.target.value })}
              onPressEnter={this.handleSubmit.bind(this)}
            />
          </div>
          <div className="filter-item">
            <SelectCategoryDropdown defaultValue="" group="performer" style={{ width: '100%' }} onSelect={(val) => this.setState({ categoryId: val }, () => this.handleSubmit())} />
          </div>
          <div className="filter-item">
            <Select
              style={{ width: '100%' }}
              defaultValue="popular"
              placeholder="Sort based on"
              onChange={(val) => this.setState({ sortBy: val }, () => this.handleSubmit())}
            >
              <Select.Option value="popular" key="popular">Top rated</Select.Option>
              <Select.Option value="newest" key="newest">Newest</Select.Option>
              <Select.Option value="oldest" key="oldest">Oldest</Select.Option>
            </Select>
          </div>
          <div className="filter-item">
            <Button
              type="primary"
              className="primary"
              style={{ width: '100%' }}
              onClick={() => this.setState({ showMore: !showMore })}
            >
              Advanced Search
              {' '}
              {showMore ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            </Button>
          </div>
        </div>
        <div className={!showMore ? 'filter-block hide' : 'filter-block'}>
          {countries.length > 0
          && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ country: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Countries"
              defaultValue=""
              showSearch
              optionFilterProp="label"
            >
              <Select.Option key="All" label="" value="">
                All countries
              </Select.Option>
              {countries.map((c) => (
                <Select.Option key={c.code} label={c.name} value={c.code}>
                  <img alt="flag" src={c.flag} width="25px" />
                  &nbsp;
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {genders.length > 0
          && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ gender: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              defaultValue=""
            >
              {genders.map((gen) => (
                <Select.Option key={gen.value} value={gen.value}>
                  {gen.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {sexualOrientations.length > 0
          && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ sexualOrientation: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              defaultValue=""
            >
              {sexualOrientations.map((gen) => (
                <Select.Option key={gen.value} value={gen.value}>
                  {gen.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {ages.length > 0
          && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ age: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Ages"
              defaultValue=""
            >
              {ages.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {eyes.length > 0
          && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ eyes: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Eyes color"
              defaultValue=""
            >
              {eyes.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {hairs.length > 0
          && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ hair: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Hair color"
              defaultValue=""
            >
              {hairs.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {pubicHairs.length > 0
          && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ pubicHair: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Pubic hair"
              defaultValue=""
            >
              {pubicHairs.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {butts.length > 0
          && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ bust: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Select butt size"
              defaultValue=""
            >
              {butts.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {heights.length > 0 && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ height: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Select height"
              defaultValue=""
            >
              {heights.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {weights.length > 0 && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ weight: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Select weight"
              defaultValue=""
            >
              {weights.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {ethnicities.length > 0
          && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ ethnicity: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Select ethnicity"
              defaultValue=""
            >
              {ethnicities.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
          {bodyTypes.length > 0
          && (
          <div className="filter-item">
            <Select
              onChange={(val) => this.setState({ bodyType: val }, () => this.handleSubmit())}
              style={{ width: '100%' }}
              placeholder="Select body type"
              defaultValue=""
            >
              {bodyTypes.map((i) => (
                <Select.Option key={i.value} value={i.value}>
                  {i.text}
                </Select.Option>
              ))}
            </Select>
          </div>
          )}
        </div>
      </div>
    );
  }
}
