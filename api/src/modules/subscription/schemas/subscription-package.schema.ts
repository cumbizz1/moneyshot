import { Schema } from 'mongoose';

export const subscriptionPackageSchema = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  ordering: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    default: 'single'
  },
  initialPeriod: {
    type: Number,
    default: 30
  },
  recurringPrice: {
    type: Number,
    default: 0
  },
  recurringPeriod: {
    type: Number,
    default: 0
  },
  // price is initial price
  price: Number,
  isActive: { type: Boolean, default: false },
  updatedAt: {
    type: Date,
    default: new Date()
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
});
