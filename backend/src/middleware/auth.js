const { verifyToken } = require('../utils/jwt');

/**
 * 从 httpOnly cookie: token 或 Authorization: Bearer xxx 中读取 JWT
 */
function authRequired(req, res, next) {
  const bearer = req.headers.authorization?.split(' ')[1];
  const token = req.cookies?.token || bearer;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: token missing' });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: token invalid' });
  }
  req.user = { id: decoded.id, email: decoded.email };
  next();
}

module.exports = { authRequired };
