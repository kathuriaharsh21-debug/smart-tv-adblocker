const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// System state (In-memory default)
let currentMode = 'Auto'; // Auto, Strict, Paused
let modeLastUpdated = new Date().toISOString();

// 1. Unauthenticated Reachability Probe (Mobile App Auto-Detection)
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'ok',
    service: 'smarttv-adblocker-gateway',
    mdns_service: '_adblock._tcp.local',
    timestamp: new Date().toISOString(),
    home_network: true
  });
});

// 2. Global Blocking Mode Endpoint (Get/Set: Auto / Strict / Paused)
app.get('/api/mode', (req, res) => {
  res.json({
    mode: currentMode,
    last_updated: modeLastUpdated,
    active_profile: currentMode === 'Strict' ? 'Strict-SmartTV' : currentMode === 'Paused' ? 'Bypass' : 'Standard-SmartTV'
  });
});

app.post('/api/mode', (req, res) => {
  const { mode } = req.body;
  if (!['Auto', 'Strict', 'Paused'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode. Must be Auto, Strict, or Paused' });
  }
  currentMode = mode;
  modeLastUpdated = new Date().toISOString();
  console.log(`[API-Gateway] Blocking mode updated to: ${currentMode}`);
  res.json({ success: true, mode: currentMode, timestamp: modeLastUpdated });
});

// Mock proxy data for standalone local execution
app.get('/api/devices', (req, res) => {
  res.json([
    { id: 'dev-1', mac: 'AA:BB:CC:11:22:33', name: 'Living Room Samsung TV', vendor: 'Samsung Electronics', type: 'Samsung', ip: '192.168.30.10', active: true, adsBlockedToday: 1420, listProfile: 'Samsung+ACR+Telemetry' },
    { id: 'dev-2', mac: 'AA:BB:CC:44:55:66', name: 'Bedroom LG WebOS TV', vendor: 'LG Electronics', type: 'LG', ip: '192.168.30.12', active: true, adsBlockedToday: 890, listProfile: 'LG-SmartAd+Telemetry' },
    { id: 'dev-3', mac: 'AA:BB:CC:77:88:99', name: 'Kids Room Roku Express', vendor: 'Roku Inc', type: 'Roku', ip: '192.168.30.15', active: true, adsBlockedToday: 2150, listProfile: 'Roku-Strict+Logs' },
    { id: 'dev-4', mac: 'AA:BB:CC:AA:BB:CC', name: 'Guest Room Fire TV Stick', vendor: 'Amazon', type: 'FireTV', ip: '192.168.30.20', active: false, adsBlockedToday: 340, listProfile: 'Amazon-Metrics' }
  ]);
});

app.get('/api/whitelist/candidates', (req, res) => {
  res.json([
    { id: 'cand-1', domain: 'image.tmdb.org', deviceName: 'Living Room Samsung TV', deviceId: 'dev-1', timestamp: new Date(Date.now() - 300000).toISOString(), category: 'App Thumbnails', recommended: true },
    { id: 'cand-2', domain: 'weather.vizio.com', deviceName: 'Guest Room Fire TV Stick', deviceId: 'dev-4', timestamp: new Date(Date.now() - 900000).toISOString(), category: 'Weather Widget', recommended: true },
    { id: 'cand-3', domain: 'hdr-auth.lgappstv.com', deviceName: 'Bedroom LG WebOS TV', deviceId: 'dev-2', timestamp: new Date(Date.now() - 1500000).toISOString(), category: 'Firmware / HDR Check', recommended: false }
  ]);
});

app.post('/api/whitelist/add', (req, res) => {
  const { domain } = req.body;
  console.log(`[API-Gateway] Domain added to whitelist: ${domain}`);
  res.json({ success: true, domain, message: `Domain ${domain} un-blocked successfully!` });
});

app.get('/api/stats/summary', (req, res) => {
  res.json({
    queriesPerSec: 14.2,
    totalQueriesToday: 48920,
    adsBlockedToday: 12450,
    blockedPercentage: 25.4,
    activeDevicesCount: 4,
    topBlockedDomains: [
      { domain: 'samsungads.com', count: 3410 },
      { domain: 'p.ads.roku.com', count: 2890 },
      { domain: 'ad.lgappstv.com', count: 1940 },
      { domain: 'device-metrics-us.amazon.com', count: 1520 },
      { domain: 'cloudservices.roku.com', count: 980 }
    ],
    timeSeriesData: [
      { time: '00:00', total: 1200, blocked: 280 },
      { time: '04:00', total: 400, blocked: 90 },
      { time: '08:00', total: 3100, blocked: 820 },
      { time: '12:00', total: 5400, blocked: 1410 },
      { time: '16:00', total: 6800, blocked: 1780 },
      { time: '20:00', total: 9200, blocked: 2450 },
      { time: 'now', total: 8400, blocked: 2130 }
    ]
  });
});

app.get('/api/lists/status', (req, res) => {
  res.json({
    last_updated: new Date(Date.now() - 7200000).toISOString(),
    total_domains: 142580,
    sources: [
      { name: 'HaGeZi Native Samsung', count: 18400, active: true },
      { name: 'HaGeZi Native LG', count: 14200, active: true },
      { name: 'HaGeZi Native Roku', count: 22100, active: true },
      { name: 'Perflyst SmartTV AGH', count: 36400, active: true },
      { name: 'Block List Project SmartTV', count: 51480, active: true }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`[API-Gateway] Server running on http://localhost:${PORT}`);
});
