import * as mongoose from 'mongoose';

const performerSchema = new mongoose.Schema({
  name: String,
  firstName: String,
  lastName: String,
  username: {
    type: String,
    index: true,
    lowercase: true,
    unique: true,
    trim: true,
    // uniq if not null
    sparse: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  status: {
    type: String,
    index: true
  },
  phone: {
    type: String
  },
  phoneCode: String, // international code prefix
  avatarId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  avatarPath: String,
  coverId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  coverPath: String,
  welcomeVideoId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  welcomeVideoPath: {
    type: String
  },
  activateWelcomeVideo: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String
  },
  country: {
    type: String
  },
  city: String,
  state: String,
  zipcode: String,
  address: String,
  languages: [
    {
      type: String
    }
  ],
  studioId: mongoose.Schema.Types.ObjectId,
  categoryIds: [
    {
      _id: false,
      type: mongoose.Schema.Types.ObjectId
    }
  ],
  height: String,
  weight: String,
  bio: String,
  eyes: String,
  butt: String,
  sexualOrientation: String,
  hair: String,
  pubicHair: String,
  bodyType: String,
  dateOfBirth: Date,
  ethnicity: String,
  stats: {
    likes: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    totalVideos: {
      type: Number,
      default: 0
    },
    totalGalleries: {
      type: Number,
      default: 0
    },
    totalProducts: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId
  },
  score: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

performerSchema.pre<any>('updateOne', async function preUpdateOne(next) {
  const model = await this.model.findOne(this.getQuery());
  const { stats } = model;
  if (!model || !stats) {
    return next();
  }
  const score = (stats.likes || 0) * 2 + (stats.views || 0);
  model.score = score || 0;
  await model.save();
  return next();
});

export const PerformerSchema = performerSchema;
