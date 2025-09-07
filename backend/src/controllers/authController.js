const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signAccessToken, verifyToken } = require('../utils/jwt');

const COOKIE_NAME = 'token';
const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',   // 本地开发足够；生产可按需改 strict/none(+secure)
  secure: false      // 生产 https 下改为 true
};

async function signup(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash });

  const token = signAccessToken({ id: user._id.toString(), email: user.email });
  res
    .cookie(COOKIE_NAME, token, cookieOpts)
    .status(201)
    .json({ message: 'signup ok', user: { id: user._id, email: user.email } });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signAccessToken({ id: user._id.toString(), email: user.email });
  res
    .cookie(COOKIE_NAME, token, cookieOpts)
    .json({ message: 'login ok', user: { id: user._id, email: user.email } });
}

async function logout(_req, res) {
  res.clearCookie(COOKIE_NAME, cookieOpts).json({ message: 'logout ok' });
}

/**
 * 简化的 refresh：如果现有 cookie/Authorization 中的 token 仍有效，就签发一个新 token
 */
async function refresh(req, res) {
  const bearer = req.headers.authorization?.split(' ')[1];
  const existing = req.cookies?.token || bearer;
  if (!existing) return res.status(401).json({ error: 'No token' });

  const decoded = verifyToken(existing);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });

  const fresh = signAccessToken({ id: decoded.id, email: decoded.email });
  res.cookie(COOKIE_NAME, fresh, cookieOpts).json({ message: 'refresh ok' });
}

async function me(req, res) {
  // 由 authRequired 注入 req.user
  res.json({ user: req.user });
}

module.exports = { signup, login, logout, refresh, me };
