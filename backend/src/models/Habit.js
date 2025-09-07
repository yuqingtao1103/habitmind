const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', trim: true },
    frequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

habitSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Habit', habitSchema);
