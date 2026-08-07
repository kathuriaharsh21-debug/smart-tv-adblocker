# Smart-TV Ad Blocker — Network Topology & Router Setup Guide

This guide details the complete hardware configuration, network isolation, and firewall strategy for deploying the Smart-TV Ad Blocker on a home network served by a **JioFiber router**.

---

## 1. JioFiber ISP Reality & Topology

### The Limitation
- JioFiber routers (192.168.29.1) run locked firmware.
- The standard Jio admin panel does **not** allow changing custom DNS servers.
- Jio's bridge mode requires specific, region-dependent WAN VLAN IDs (commonly between `1015-1032`) which Jio does not officially publish.

### The Recommended Solution: Downstream Router (Double-NAT)
Instead of risking connection instability by attempting undocumented bridge mode, connect a small OpenWrt-native travel router (e.g. **GL.iNet GL-MT3000 "Beryl AX"** or **GL-AXT1800 "Slate AX"**) to the Jio router.

```
 Internet 
    │
    ▼
┌─────────────────────────────────────────┐
│ JioFiber Router (192.168.29.1)          │
│ (Untouched, handles standard home devices)│
└──────────────────┬──────────────────────┘
                   │ (LAN Port -> WAN Port)
                   ▼
┌─────────────────────────────────────────┐
│ GL.iNet / OpenWrt Router (192.168.30.1) │
│ (Runs DHCP + Layer 2 Firewall Rules)    │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Smart TVs (Samsung, LG, Roku, Fire TV)  │
│ (DHCP & DNS forced through AdGuard)     │
└─────────────────────────────────────────┘
```

---

## 2. Step-by-Step Setup Instructions

### Step 1: Physical Wiring
1. Plug an Ethernet cable from any LAN port of the Jio router into the **WAN port** of the GL.iNet/OpenWrt router.
2. Ensure the GL.iNet router is set to **Router Mode** (creating its own subnet, e.g., `192.168.30.x`).

### Step 2: Connect Smart TVs
1. Connect all your Smart TVs (Samsung, LG WebOS, Roku, Fire TV, Android TV) exclusively to the Wi-Fi or LAN ports of the GL.iNet router.
2. Do **not** connect Smart TVs directly to the Jio Fiber Wi-Fi.

### Step 3: Layer 2 Bypass Prevention (Firewall Enforcement)
Smart TVs hardcode fallback DoH/DoT resolvers (Google `8.8.8.8`, Cloudflare `1.1.1.1`). Apply the included OpenWrt rules to force compliance:

1. Copy [`infra/firewall/uci-rules.sh`](file:///d:/Study%20M/router_addBlocker/infra/firewall/uci-rules.sh) to your router.
2. Run `sh /tmp/uci-rules.sh` via SSH.
3. This ensures:
   - **NAT Redirection**: All port 53 traffic is forcefully redirected to AdGuard Home.
   - **DoH/DoT Block**: Outbound port 443 to Google/Cloudflare DoH bootstrap IPs and port 853 DoT are dropped.

---

## 3. Disclaimers & App Behavior

> [!WARNING]
> **Hotstar & SonyLIV Video Ads**: Server-Side Ad Insertion (SSAI) splices ads directly into the main video stream from the same CDN domain. This system blocks interface banners, promo tiles, telemetry/ACR tracking, and pre-roll ads from dedicated ad servers, but **will not strip in-stream SSAI video ads** on Hotstar or SonyLIV live sports/IPL matches.
