// backend/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:    { type: String, unique: true, required: true, index: true },
  password: { type: String, required: true },
  // 是否订阅每周邮件（默认不订阅）
  emailOptIn: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

