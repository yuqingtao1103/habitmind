// backend/src/services/email.js
const sgMail = require('@sendgrid/mail');

// 开关：本地“干跑”不实际发信
const DRY = process.env.EMAIL_DRY_RUN === 'true';

function normalizeKey(raw = '') {
  return raw.trim().replace(/^['"]+|['"]+$/g, '').replace(/\r?\n/g, '');
}

function initEmail() {
  if (DRY) {
    console.log('[email] DRY RUN enabled — will not send real emails');
    return true; // 允许任务继续跑（只是打印）
  }

  const key = normalizeKey(process.env.SENDGRID_API_KEY || '');
  if (!key) {
    console.warn('[email] SENDGRID_API_KEY not set; email disabled');
    return false; // 没 key 就禁用（非干跑模式）
  }
  if (!key.startsWith('SG.')) {
    console.warn('[email] Warning: API key does not start with "SG." — double-check it');
  }
  sgMail.setApiKey(key);
  return true;
}

async function sendEmail({ to, subject, html, text }) {
  if (DRY) {
    console.log('[email][dry-run]', { to, subject });
    return;
  }
  const from = process.env.EMAIL_FROM || 'no-reply@habitmind.local';
  const msg = {
    to,
    from,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ' ')
  };
  const bcc = (process.env.EMAIL_BCC || '').split(',').map(s => s.trim()).filter(Boolean);
  if (bcc.length) msg.bcc = bcc;

  await sgMail.send(msg);
}

module.exports = { initEmail, sendEmail };
