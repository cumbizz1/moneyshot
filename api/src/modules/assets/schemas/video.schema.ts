import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export const VideoSchema = new Schema({
  performerIds: [{
    _id: false,
    type: ObjectId,
    index: true
  }],
  categoryIds: [{
    _id: false,
    type: ObjectId,
    index: true
  }],
  fileId: ObjectId,
  title: String,
  slug: {
    type: String,
    index: true,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true
  },
  description: String,
  status: {
    type: String,
    default: 'active'
  },
  tags: [
    { type: String, index: true }
  ],
  isSchedule: {
    type: Boolean,
    default: false
  },
  scheduledAt: {
    type: Date
  },
  isSale: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  teaserId: ObjectId,
  teaserProcessing: Boolean,
  processing: Boolean,
  thumbnailId: ObjectId,
  stats: {
    likes: {
      type: Number,
      default: 0
    },
    wishlist: {
      type: Number,
      default: 0
    },
    favourites: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    }
  },
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'videos'
});
