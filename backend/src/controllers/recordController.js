const Record = require('../models/Record');
const Habit = require('../models/Habit');
const { startOfDayUTC, lastNDaysUTC } = require('../utils/dates');

/**
 * POST /api/records/:habitId
 * body: { date?: string(ISO), status?: boolean }
 * - 若给 status，则设置为该值；
 * - 若不传 status，则在该日期上 "切换"（没有→true；已有→取反）
 * - 仅允许操作自己的 habit
 */
async function upsertRecord(req, res) {
  const userId = req.user.id;
  const { habitId } = req.params;
  const { date, status } = req.body || {};

  // 1) 权限：确保该 habit 属于当前用户
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) return res.status(404).json({ error: 'Habit not found or not yours' });

  // 2) 归一日期（默认今天 UTC）
  const day = startOfDayUTC(date ? new Date(date) : new Date());

  // 3) 查找当天记录
  let rec = await Record.findOne({ habitId, date: day });

  if (typeof status === 'boolean') {
    // 显式设置
    if (!rec) {
      rec = await Record.create({ habitId, date: day, status });
    } else {
      rec.status = status;
      await rec.save();
    }
  } else {
    // 切换
    if (!rec) {
      rec = await Record.create({ habitId, date: day, status: true });
    } else {
      rec.status = !rec.status;
      await rec.save();
    }
  }

  return res.status(200).json({ message: 'ok', record: rec });
}

/**
 * GET /api/records?habitId=...&range=week
 * 返回最近 7 天（含今天）的 { date, status } 列表（无记录默认为 false）
 */
async function getRange(req, res) {
  const userId = req.user.id;
  const { habitId } = req.query;
  if (!habitId) return res.status(400).json({ error: 'habitId is required' });

  // 权限校验
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) return res.status(404).json({ error: 'Habit not found or not yours' });

  const days = lastNDaysUTC(7);
  const records = await Record.find({
    habitId,
    date: { $gte: days[0], $lte: days[days.length - 1] }
  });

  // 映射到 {dateISO, status}
  const map = new Map(records.map(r => [r.date.toISOString(), r.status]));
  const list = days.map(d => ({
    date: d.toISOString(),
    status: map.get(d.toISOString()) ?? false
  }));

  res.json({ habitId, range: 'week', items: list });
}

module.exports = { upsertRecord, getRange };
