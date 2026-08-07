const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// In-memory state for schedules & device rules
let deviceProfiles = {
  'dev-1': { mac: 'AA:BB:CC:11:22:33', name: 'Living Room Samsung TV', rules: ['samsung.txt', 'perflyst_smarttv.txt'], scheduleEnabled: true, scheduleStart: '06:00', scheduleEnd: '21:00' },
  'dev-2': { mac: 'AA:BB:CC:44:55:66', name: 'Bedroom LG WebOS TV', rules: ['lg.txt', 'perflyst_smarttv.txt'], scheduleEnabled: false },
  'dev-3': { mac: 'AA:BB:CC:77:88:99', name: 'Kids Room Roku Express', rules: ['roku.txt', 'perflyst_smarttv.txt'], scheduleEnabled: true, scheduleStart: '07:00', scheduleEnd: '20:00' }
};

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'orchestrator-api' }));

app.get('/profiles', (req, res) => res.json(deviceProfiles));

app.post('/profiles/update', (req, res) => {
  const { deviceId, rules, scheduleEnabled, scheduleStart, scheduleEnd } = req.body;
  if (deviceProfiles[deviceId]) {
    deviceProfiles[deviceId] = { ...deviceProfiles[deviceId], rules, scheduleEnabled, scheduleStart, scheduleEnd };
    console.log(`[Orchestrator] Updated profile for ${deviceId}`);
    return res.json({ success: true, profile: deviceProfiles[deviceId] });
  }
  res.status(404).json({ error: 'Device profile not found' });
});

app.listen(PORT, () => {
  console.log(`[Orchestrator-API] Server running on http://localhost:${PORT}`);
});
