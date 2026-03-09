import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export const PostMetaSchema = new Schema({
  postId: {
    type: ObjectId,
    index: true,
    required: true
  },
  key: {
    type: String,
    index: true
  },
  value: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
