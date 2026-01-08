const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(16),
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
