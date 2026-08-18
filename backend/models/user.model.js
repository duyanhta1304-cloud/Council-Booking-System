import mongoose from 'mongoose'


export default userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true, // creates a unique index, same as SQL UNIQUE
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    profilePictureUrl: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      postcode: { type: String },
      country: { type: String },
    },
    role: {
      type: String,
      enum: ['resident', 'staff', 'admin'],
      default: 'resident',
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt, replaces your manual columns
  }
);
