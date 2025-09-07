const Habit = require('../models/Habit');
const Record = require('../models/Record');
const { startOfDayUTC } = require('../utils/dates');

async function weeklyStatsForUser(userId) {
  const now = new Date();
  const today = startOfDayUTC(now);
  const day = today.getUTCDay();               // 0-6 Sun-Sat
  const daysSinceMonday = (day + 6) % 7;       // Monday=0
  const monday = new Date(today.getTime() - daysSinceMonday * 86400000);

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
  return { weekStart: monday, weekEnd: today, totalDone, byHabit };
}

async function streakForUser(userId) {
  const habits = await Habit.find({ userId }, { _id: 1 });
  if (!habits.length) return { current: 0, longest: 0 };

  const recs = await Record.find(
    { habitId: { $in: habits.map(h => h._id) }, status: true },
    { date: 1 }
  );
  const days = new Set(recs.map(r => new Date(r.date).toISOString()));

  let current = 0, longest = 0, streak = 0;
  let cursor = startOfDayUTC(new Date());
  const minDate = recs.length
    ? new Date(Math.min(...recs.map(r => new Date(r.date).getTime())))
    : cursor;

  while (cursor.getTime() >= minDate.getTime()) {
    const iso = cursor.toISOString();
    if (days.has(iso)) {
      streak += 1;
      if (streak > longest) longest = streak;
    } else {
      if (current === 0) current = streak;
      streak = 0;
    }
    cursor = new Date(cursor.getTime() - 86400000);
  }
  if (current === 0) current = streak;

  return { current, longest };
}

module.exports = { weeklyStatsForUser, streakForUser };
