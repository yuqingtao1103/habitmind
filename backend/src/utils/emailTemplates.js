function renderWeeklyEmail(userEmail, stats, streak) {
  const weekStart = stats.weekStart.toISOString().slice(0,10);
  const weekEnd   = stats.weekEnd.toISOString().slice(0,10);

  const subject = `HabitMind Weekly Report (${weekStart} → ${weekEnd})`;

  const tableRows = stats.byHabit.map(h =>
    `<tr><td style="padding:6px 10px;border:1px solid #eee">${escapeHtml(h.title)}</td>
         <td style="padding:6px 10px;border:1px solid #eee;text-align:center">${h.done}</td></tr>`
  ).join('');

  const html = `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Arial; color:#0f172a">
    <h2 style="margin:0 0 8px">Hi ${escapeHtml(userEmail)},</h2>
    <p style="margin:0 0 12px">Here is your weekly progress (${weekStart} → ${weekEnd}).</p>
    <p style="margin:0 0 12px"><b>Total completions:</b> ${stats.totalDone}</p>

    <table style="border-collapse:collapse;border:1px solid #eee">
      <thead>
        <tr>
          <th style="padding:6px 10px;border:1px solid #eee;text-align:left">Habit</th>
          <th style="padding:6px 10px;border:1px solid #eee;text-align:center">Done</th>
        </tr>
      </thead>
      <tbody>${tableRows || '<tr><td colspan="2" style="padding:8px">No data yet.</td></tr>'}</tbody>
    </table>

    <p style="margin:16px 0 0"><b>Streak</b> — Current: ${streak.current} day(s), Longest: ${streak.longest} day(s)</p>
    <p style="margin:12px 0 0; color:#64748b">Keep it up! 💪</p>
  </div>`;

  const text = `Hi ${userEmail}
Weekly Report (${weekStart} -> ${weekEnd})
Total completions: ${stats.totalDone}
Streak: current ${streak.current}, longest ${streak.longest}
` + (stats.byHabit.map(h => `- ${h.title}: ${h.done}`).join('\n') || 'No data yet.');

  return { subject, html, text };
}

function escapeHtml(s=''){ return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])) }

module.exports = { renderWeeklyEmail };
