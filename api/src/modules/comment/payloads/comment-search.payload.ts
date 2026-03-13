import { ObjectId } from 'mongodb';
import { SearchRequest } from 'src/kernel/common';

export class CommentSearchRequestPayload extends SearchRequest {
  objectId?: string | ObjectId;

  objectType?: string;

  constructor(options?: Partial<CommentSearchRequestPayload>) {
    super(options);

    this.objectId = options?.objectId;
    this.objectType = options?.objectType;
  }
}
