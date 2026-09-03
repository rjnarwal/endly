# ⚡ Endly — Modern, Privacy-First API Client & Mobile Proxy Interceptor

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![Live Web App](https://img.shields.io/badge/Web_App-endly.grassroot.digital-f97316.svg)](https://endly.grassroot.digital)
[![Author](https://img.shields.io/badge/Author-Rajesh_Narwal-blue.svg)](https://grassroot.digital/#about)
[![GitHub](https://img.shields.io/badge/GitHub-rjnarwal-181717.svg?logo=github)](https://github.com/rjnarwal)

**Endly** is a high-performance, local-first API development and debugging suite built as a lightweight, zero-cloud alternative to Postman. Features full WebSocket testing, automated Collection Runners, cURL import/export, and a real-time **Mobile Proxy Interceptor** for inspecting live Android & iOS HTTP/HTTPS network traffic.

---

## ✨ Core Features

- 🚀 **100% Local-First & Zero-Cloud Telemetry**: All workspaces, collections, environments, request histories, and runner logs are stored locally in your browser's IndexedDB.
- 📱 **Native Mobile Network Interceptor**: Built-in HTTP/HTTPS reverse proxy capturing live mobile traffic directly from physical devices and Android/iOS emulators with zero certificate hassle.
- ⚡ **Multi-Protocol Support**: REST (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) & Real-Time WebSockets (`ws://`, `wss://`).
- 🔄 **Automated Collection Runner**: Execute parameterized batches with environment variable interpolation and execution analytics.
- 💻 **Cross-Platform Native Desktop**: Available for macOS (`.dmg`) and Windows (`.exe`).

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/rjnarwal/endly.git
cd endly

# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Run Mobile Proxy Daemon
npm run proxy
```

---

## 📦 Building Desktop Binaries

```bash
# Build macOS DMG installer
npm run build:mac

# Build Windows Installer
npm run build:win
```

---

## 📄 License

MIT License © 2026 [Rajesh Narwal](https://grassroot.digital/#about)
