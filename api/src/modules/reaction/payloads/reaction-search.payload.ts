import { ObjectId } from 'mongodb';
import { SearchRequest } from 'src/kernel/common';

export class ReactionSearchRequestPayload extends SearchRequest {
  objectId?: string | ObjectId;

  action?: string;

  objectType?: string;

  createdBy?: string | ObjectId;

  constructor(options?: Partial<ReactionSearchRequestPayload>) {
    super(options);

    this.objectId = options?.objectId;
    this.action = options?.action;
    this.objectType = options?.objectType;
    this.createdBy = options?.createdBy;
  }
}
