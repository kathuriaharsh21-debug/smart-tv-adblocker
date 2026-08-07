# 🛡️ Smart-TV Ad Blocker — Network-Wide Appliance

A multi-service, self-hosted ad, telemetry, and ACR tracking blocker designed specifically for Smart TVs (Samsung, LG WebOS, Roku, Fire TV, Android TV, Vizio) connected to home networks (including JioFiber routers).

---

## 🌟 Key Features

1. **Layered Ad & Telemetry Sinkhole**: Driven by **AdGuard Home** engine + **Unbound** recursive resolver in Docker.
2. **Smart TV Blocklists**: Curated HaGeZi native lists (`native.roku.txt`, `native.samsung.txt`, `native.lg.txt`), Perflyst SmartTV AGH, and Block List Project lists.
3. **Layer 2 DoH Bypass Prevention**: OpenWrt `nftables`/`UCI` firewall rules that force port 53 NAT redirection and block outbound port 443/853 to hardcoded fallback DoH resolvers (Google 8.8.8.8, Cloudflare 1.1.1.1).
4. **JioFiber Double-NAT Topology**: Sits behindlocked ISP routers via a small downstream travel router (e.g., GL.iNet GL-MT3000 Beryl AX) without requiring unpublished VLAN IDs.
5. **Modern Glassmorphism Web Dashboard**: Live query speed gauges, ads blocked today counter, per-device ruleset profile editor, one-click "An App Just Broke" candidate domain whitelist workflow, and interactive router setup wizard.
6. **Mobile Companion App**: React Native (Expo) client codebase featuring network reachability probe (`/api/ping` over `_adblock._tcp.local`) and iOS Shortcuts webhook automation.

---

## 🏗️ Multi-Service Repository Architecture

```
smart-tv-adblocker/
├── docker-compose.yml         # Container orchestration for all microservices
├── dns/                       # Core DNS engine & recursive resolver configs
│   ├── adguardhome/
│   └── unbound/
├── blocklists/                # Curated Smart TV manufacturer lists
│   └── smart-tv/
├── services/                  # Microservices
│   ├── api-gateway/           # REST Gateway & mDNS reachability server
│   ├── orchestrator-api/      # Device profile logic & AdGuard API driver
│   ├── list-updater/          # Automatic blocklist pull & merge worker
│   ├── stats-service/         # Time-series analytics aggregator
│   ├── firewall-manager/      # OpenWrt nftables/UCI rule generator
│   └── notification-service/  # Push alerts (ntfy integration)
├── frontend/                  # Glassmorphism Web Dashboard
├── mobile/                    # React Native / Expo companion app
├── infra/                     # Reverse proxy & firewall rules
│   ├── caddy/
│   └── firewall/
└── docs/                      # JioFiber topology & setup guides
```

---

## 🚀 Quick Start & Local Execution

### 1. Launch Web Dashboard & API Gateway Locally
```bash
# Install dependencies & start API Gateway
cd services/api-gateway
npm install
npm start

# In a new terminal, launch the Glassmorphism Web Dashboard
cd frontend
npm install
npm start
```
Access the dashboard at: **`http://localhost:3000`**

### 2. Launch Docker Multi-Service Stack (Production / Appliance)
```bash
docker-compose up -d
```
Access Caddy Reverse Proxy at: **`https://adblock.home.lan`**

---

## ⚠️ SSAI Limitation Note
DNS blocking eliminates interface banners, promo tiles, ACR telemetry tracking, and pre-roll ads served from separate ad-network domains. It **cannot strip Server-Side Ad Insertion (SSAI)** spliced directly into main video streams (e.g. YouTube, Hotstar, or SonyLIV live sports/IPL matches) without breaking video playback.
