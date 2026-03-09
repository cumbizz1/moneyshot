import CommentItem from '@components/comment/comment-item';
import { Spin } from 'antd';
import { IUser } from 'src/interfaces/index';

import { IComment } from '../../interfaces/comment';
import style from './comment-list.module.less';

interface IProps {
  comments: IComment[];
  requesting: boolean;
  // eslint-disable-next-line react/require-default-props
  onDelete?: Function;
  // eslint-disable-next-line react/require-default-props
  user?: IUser;
  // eslint-disable-next-line react/require-default-props
  canReply?: boolean
}

export function ListComments({
  comments, requesting, user, onDelete, canReply
}: IProps) {
  return (
    <div className={style['cmt-list']}>
      {comments.length > 0 && !requesting && comments.map((comment: IComment) => <CommentItem canReply={canReply} key={comment._id} item={comment} user={user} onDelete={onDelete} />)}
      {requesting && <div className="text-center" style={{ margin: '20px 0' }}><Spin /></div>}
      {!requesting && !comments.length && <div className="text-center" style={{ margin: '20px 0' }}>No comment was found</div>}
    </div>
  );
}

export default ListComments;
