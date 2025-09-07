// backend/src/controllers/settingsController.js
const User = require('../models/User');

async function getNotifications(req, res) {
  const user = await User.findById(req.user.id, { email: 1, emailOptIn: 1 });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ email: user.email, emailOptIn: !!user.emailOptIn });
}

async function updateNotifications(req, res) {
  const { emailOptIn } = req.body || {};
  if (typeof emailOptIn !== 'boolean') {
    return res.status(400).json({ error: 'emailOptIn boolean required' });
  }
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { emailOptIn } },
    { new: true, projection: { email: 1, emailOptIn: 1 } }
  );
  res.json({ message: 'ok', email: user.email, emailOptIn: !!user.emailOptIn });
}

module.exports = { getNotifications, updateNotifications };
