const Record = require('../models/Record');
const Habit = require('../models/Habit');
const { startOfDayUTC } = require('../utils/dates');

/**
 * GET /api/stats/weekly
 * 本周（周一 00:00:00 UTC 至今）完成记录数 totalDone，
 * 以及按 habit 的统计 [{habitId, title, done}]
 */
async function weeklyStats(req, res) {
  const userId = req.user.id;

  const now = new Date();
  const today = startOfDayUTC(now);
  // 计算本周一（以周一为一周起点）
  const day = today.getUTCDay(); // 0-6 (Sun-Sat)
  const daysSinceMonday = (day + 6) % 7; // 周一=0
  const monday = new Date(today.getTime() - daysSinceMonday * 86400000);

  // 找出该用户的所有 habits
  const habits = await Habit.find({ userId }, { _id: 1, title: 1 });

  const agg = await Record.aggregate([
    { $match: { habitId: { $in: habits.map(h => h._id) }, date: { $gte: monday, $lte: today }, status: true } },
    { $group: { _id: '$habitId', done: { $sum: 1 } } }
  ]);

  const byHabit = habits.map(h => {
    const hit = agg.find(a => String(a._id) === String(h._id));
    return { habitId: h._id, title: h.title, done: hit ? hit.done : 0 };
  });

  const totalDone = byHabit.reduce((s, x) => s + x.done, 0);
  res.json({ weekStart: monday.toISOString(), weekEnd: today.toISOString(), totalDone, byHabit });
}

/**
 * GET /api/stats/streak
 * 以“每天是否至少完成一个习惯”为口径，计算当前连击 & 历史最长连击
 */
async function streakStats(req, res) {
  const userId = req.user.id;

  // 找出该用户所有 habits
  const habits = await Habit.find({ userId }, { _id: 1 });
  if (habits.length === 0) return res.json({ current: 0, longest: 0 });

  // 拉全量完成记录（只取 status=true），投影成当天的 ISO 字符串集合
  const recs = await Record.find({ habitId: { $in: habits.map(h => h._id) }, status: true }, { date: 1 });
  const days = new Set(recs.map(r => new Date(r.date).toISOString())); // 已经是 00:00 UTC

  // 从今天往回扫，算 current；同时在一次遍历中算 longest
  let current = 0, longest = 0, streak = 0;
  let cursor = startOfDayUTC(new Date());
  // 为了避免无限回溯，这里回溯至最早记录的前一天
  const minDate = recs.length ? new Date(Math.min(...recs.map(r => new Date(r.date).getTime()))) : cursor;

  while (cursor.getTime() >= minDate.getTime()) {
    const iso = cursor.toISOString();
    if (days.has(iso)) {
      streak += 1;
      if (streak > longest) longest = streak;
    } else {
      // 断档：重置 streak；若还未遇到第一次断档前的 streak 就是 current
      if (current === 0) current = streak;
      streak = 0;
    }
    // 前一天
    cursor = new Date(cursor.getTime() - 86400000);
  }
  if (current === 0) current = streak; // 如果从未断过

  res.json({ current, longest });
}

module.exports = { weeklyStats, streakStats };
