// backend/src/jobs/weeklyEmail.js
const cron = require('node-cron');
const User = require('../models/User');
const { initEmail, sendEmail } = require('../services/email');
const { weeklyStatsForUser, streakForUser } = require('../services/reportService');
const { renderWeeklyEmail } = require('../utils/emailTemplates');

function startWeeklyEmailJob() {
  const enabled = initEmail();
  if (!enabled) {
    console.log('[job] weeklyEmail disabled (no SENDGRID_API_KEY and not DRY RUN)');
    return;
  }

  const schedule = process.env.CRON_SCHEDULE || '0 9 * * 1';
  const timezone = process.env.CRON_TZ || 'Etc/UTC';

  cron.schedule(schedule, async () => {
    console.log('[job] weeklyEmail start');
    try {
      const users = await User.find({ emailOptIn: true }, { email: 1 });
      for (const u of users) {
        const stats = await weeklyStatsForUser(u._id);
        const streak = await streakForUser(u._id);
        const { subject, html, text } = renderWeeklyEmail(u.email, stats, streak);
        try {
          await sendEmail({ to: u.email, subject, html, text });
          console.log('[job] sent', u.email);
        } catch (e) {
          console.error('[job] send failed:', u.email, e.message);
        }
      }
      console.log('[job] weeklyEmail done');
    } catch (e) {
      console.error('[job] weeklyEmail error:', e);
    }
  }, { timezone });

  console.log(`[job] weeklyEmail scheduled "${schedule}", TZ=${timezone}`);
}

module.exports = { startWeeklyEmailJob };
