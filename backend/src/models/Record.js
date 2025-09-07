const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    date: { type: Date, required: true },      // 建议统一到当天 00:00:00 UTC
    status: { type: Boolean, default: true }   // true=完成，false=未完成/撤销
  },
  { versionKey: false }
);

// 限制：同一 habit 同一天最多一条
recordSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Record', recordSchema);
