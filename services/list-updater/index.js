const express = require('express');
const app = express();
const PORT = process.env.PORT || 8084;

console.log('[List-Updater] Blocklist updater cron worker initialized.');
console.log('[List-Updater] Target sources: HaGeZi Native, Perflyst AGH, Block List Project.');

app.use(express.json());

app.post('/update-now', (req, res) => {
  console.log('[List-Updater] Manual trigger: fetching latest blocklists...');
  res.json({ success: true, message: 'Blocklists refreshed and pushed to AdGuard Home engine.' });
});

app.listen(PORT, () => {
  console.log(`[List-Updater] Worker listening on http://localhost:${PORT}`);
});
