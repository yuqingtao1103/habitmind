const devRouter = require('./routes/dev');
const recordsRouter = require('./routes/records');
const statsRouter = require('./routes/stats');
const habitsRouter = require('./routes/habits');
const authRouter = require('./routes/auth');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const createError = require('http-errors');
const settingsRouter = require('./routes/settings');

const { connectDB } = require('./config/db');
const healthRouter = require('./routes/health');

const app = express();

// 连接数据库
connectDB();
app.set('trust proxy', 1);

// 基础中间件
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// 限流（按需调整）
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
}));

// CORS
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));


// 路由
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/records', recordsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/dev', devRouter);
app.use('/api/settings', settingsRouter);

app.get('/', (_req, res) => {
  res.send('HabitMind backend is running. Try GET /api/health');
});

// 兜底 404 → 错误处理中间件
app.use((req, _res, next) => next(createError(404, `Not Found: ${req.originalUrl}`)));

// 全局错误处理
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;

