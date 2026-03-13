import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export const ProductSchema = new Schema({
  // original file
  digitalFileId: ObjectId,
  imageIds: [{
    _id: false,
    type: Schema.Types.ObjectId
  }],
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
  type: {
    type: String,
    default: 'physical'
  },
  status: {
    type: String,
    default: 'active'
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
  stock: {
    type: Number,
    default: 0
  },
  categoryIds: [{
    _id: false,
    type: Schema.Types.ObjectId
  }],
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'products'
});
