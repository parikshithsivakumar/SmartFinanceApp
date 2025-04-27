import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const UserModel = mongoose.model('User', UserSchema);
