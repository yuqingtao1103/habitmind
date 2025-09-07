const express = require('express');
const { authRequired } = require('../middleware/auth');
const { initEmail, sendEmail } = require('../services/email');
const { weeklyStatsForUser, streakForUser } = require('../services/reportService');
const { renderWeeklyEmail } = require('../utils/emailTemplates');

const router = express.Router();

// 手动触发给当前登录用户发一封测试邮件
router.post('/send-test-email', authRequired, async (req, res) => {
  if (!initEmail()) return res.status(400).json({ error: 'Email disabled: no SENDGRID_API_KEY' });

  const userId = req.user.id;
  const to = req.user.email;
  const stats = await weeklyStatsForUser(userId);
  const streak = await streakForUser(userId);
  const { subject, html, text } = renderWeeklyEmail(to, stats, streak);

  try {
    await sendEmail({ to, subject, html, text });
    res.json({ message: 'sent', to, subject });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
