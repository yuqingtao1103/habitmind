const Habit = require('../models/Habit');

/**
 * GET /api/habits?page=1&limit=10
 * 只返回当前登录用户的习惯，按创建时间倒序
 */
async function listHabits(req, res) {
  const userId = req.user.id;
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Habit.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Habit.countDocuments({ userId })
  ]);

  res.json({
    page, limit, total, items
  });
}

/**
 * POST /api/habits
 * body: { title, description?, frequency? }
 */
async function createHabit(req, res) {
  const userId = req.user.id;
  const { title, description = '', frequency = 'daily' } = req.body;

  const habit = await Habit.create({ userId, title, description, frequency });
  res.status(201).json({ message: 'created', habit });
}

/**
 * PUT /api/habits/:id
 * 只能更新自己的习惯
 */
async function updateHabit(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, description, frequency } = req.body;

  const habit = await Habit.findOneAndUpdate(
    { _id: id, userId },
    { $set: { title, description, frequency } },
    { new: true }
  );
  if (!habit) return res.status(404).json({ error: 'Habit not found' });

  res.json({ message: 'updated', habit });
}

/**
 * DELETE /api/habits/:id
 */
async function deleteHabit(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const deleted = await Habit.findOneAndDelete({ _id: id, userId });
  if (!deleted) return res.status(404).json({ error: 'Habit not found' });

  res.json({ message: 'deleted' });
}

module.exports = { listHabits, createHabit, updateHabit, deleteHabit };
