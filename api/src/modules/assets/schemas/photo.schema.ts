import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export const PhotoSchema = new Schema({
  target: {
    type: String,
    index: true,
    default: 'gallery'
  },
  targetId: {
    type: ObjectId,
    index: true
  },
  // original file
  fileId: ObjectId,
  title: {
    type: String
    // TODO - text index?
  },
  description: String,
  status: {
    type: String,
    // draft, active, pending, file-error
    default: 'active'
  },
  processing: Boolean,
  isCover: {
    type: Boolean,
    default: false
  },
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'photos'
});
