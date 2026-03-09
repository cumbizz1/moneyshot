import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export const GallerySchema = new Schema({
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
  type: {
    type: String,
    index: true
  },
  name: {
    type: String
  },
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
    // draft, active
    default: 'active'
  },
  isSale: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  stats: {
    comments: {
      type: Number,
      default: 0
    },
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
    }
  },
  numOfItems: {
    type: Number,
    default: 0
  },
  coverPhotoId: ObjectId,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'galleries'
});
