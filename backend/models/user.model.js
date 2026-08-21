import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // creates a unique index, same as SQL UNIQUE
      lowercase: true,
      trim: true,
    },
    // Only set for authProvider 'local'. select:false keeps it out of every
    // normal query — use .select('+passwordHash') when verifying a login.
    passwordHash: {
      type: String,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      index: true,
      sparse: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
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
    timestamps: true, // auto-adds createdAt and updatedAt
  }
);

// Shape sent to the client. Never includes passwordHash.
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    emailVerified: this.emailVerified,
    profilePictureUrl: this.profilePictureUrl,
    phoneNumber: this.phoneNumber,
    address: this.address,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  }
}

const User = mongoose.model('User', userSchema)

export default User
