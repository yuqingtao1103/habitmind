require('dotenv').config();
const app = require('./app');
const { startWeeklyEmailJob } = require('./jobs/weeklyEmail'); // 新增

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[backend] Server listening on port ${PORT}`);
  startWeeklyEmailJob(); // 新增：应用启动时挂上定时任务
});
