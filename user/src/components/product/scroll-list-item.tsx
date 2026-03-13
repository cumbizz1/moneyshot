import { Spin } from 'antd';
import { PureComponent } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { IProduct } from 'src/interfaces';

import { PerformerListProduct } from './performer-list-product';

interface IProps {
  items: IProduct[];
  canLoadmore: boolean;
  loadMore(): Function;
  loading: boolean;
  currencySymbol: string;
}

export class ScrollListProduct extends PureComponent<IProps> {
  render() {
    const {
      items = [], loadMore, canLoadmore = false, loading = false, currencySymbol
    } = this.props;
    return (
      <InfiniteScroll
        dataLength={items.length}
        hasMore={canLoadmore}
        loader={null}
        next={loadMore}
        endMessage={null}
        scrollThreshold={0.9}
      >
        <PerformerListProduct products={items} currencySymbol={currencySymbol} />
        {!loading && !items.length && <div className="text-center">No product was found</div>}
        {loading && <div className="text-center"><Spin /></div>}
      </InfiniteScroll>
    );
  }
}
