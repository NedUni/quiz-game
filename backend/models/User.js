// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      // Username case-insensitive uniqueness: store as-is, but enforce lowercase index.
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      // never returned by default, even if someone forgets the toJSON transform
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash the password before saving if it has changed (or is new).
// Note: in our flow we set passwordHash directly in the controller, but this
// is a safety net in case anyone later assigns a plaintext password to it.
userSchema.pre('save', async function preSave(next) {
  // Only hash if the value still looks like a plaintext password (no $2 prefix).
  if (this.isModified('passwordHash') && !this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
  }
  next();
});

// Instance method for login comparison.
userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Static helper used by the auth controller to hash on registration.
userSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

module.exports = mongoose.model('User', userSchema);
