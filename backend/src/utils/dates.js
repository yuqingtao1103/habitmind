// 将任意时间归一到当天 00:00:00.000 (UTC)
function startOfDayUTC(d = new Date()) {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
}

// 最近 n 天的 UTC 日期数组（含今天，倒序或正序都可）
function lastNDaysUTC(n = 7) {
  const arr = [];
  const today = startOfDayUTC();
  for (let i = n - 1; i >= 0; i--) {
    arr.push(new Date(today.getTime() - i * 24 * 60 * 60 * 1000));
  }
  return arr;
}

module.exports = { startOfDayUTC, lastNDaysUTC };
