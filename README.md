# ⚡ Endly — Modern, Privacy-First API Client & Mobile Proxy Interceptor

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![Live Web App](https://img.shields.io/badge/Web_App-grassroot.digital%2Fapi--client-f97316.svg)](https://grassroot.digital/api-client)
[![Developer Hub](https://img.shields.io/badge/Platform-Grassroot_Digital-10b981.svg)](https://grassroot.digital)
[![Author](https://img.shields.io/badge/Author-Rajesh_Narwal-blue.svg)](https://grassroot.digital/#about)
[![GitHub](https://img.shields.io/badge/GitHub-rjnarwal-181717.svg?logo=github)](https://github.com/rjnarwal)

**[Endly](https://grassroot.digital/api-client)** is a lightweight, zero-cloud web API client, GraphQL debugger, and HTTP collection runner with built-in Wi-Fi mobile proxy network interception and 100% browser-local storage.

🌐 **Try Online**: **[https://grassroot.digital/api-client](https://grassroot.digital/api-client)**  
🚀 **Grassroot Digital Suite**: **[https://grassroot.digital](https://grassroot.digital)**

---

## ✨ Core Features

- 🚀 **100% Local-First & Zero-Cloud Telemetry**: All workspaces, collections, environments, request histories, and runner logs are stored locally in your browser's IndexedDB.
- 📱 **Native Mobile Network Interceptor**: Built-in HTTP/HTTPS reverse proxy capturing live mobile traffic directly from physical iOS / Android devices and emulators with zero certificate hassle.
- ⚡ **Multi-Protocol Testing**: REST (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) & Real-Time WebSockets (`ws://`, `wss://`).
- 🔄 **Automated Collection Runner**: Execute parameterized batches with environment variable interpolation and execution analytics.
- 📤 **cURL & Postman Import/Export**: Effortlessly import cURL commands or Postman collections directly into your local workspace.
- 💻 **Cross-Platform Native Desktop**: Available for macOS (`.dmg`) and Windows (`.exe`).

---

## 🛠️ Privacy-First Developer Tools by Grassroot Digital

Endly is part of the **[Grassroot Digital](https://grassroot.digital)** ecosystem of 100% in-browser, privacy-first developer utilities:

| Tool | Description | Live Canonical App |
| :--- | :--- | :--- |
| **⚡ Endly** | Lightweight Web API Client, WebSocket & Mobile Proxy Interceptor | [grassroot.digital/api-client](https://grassroot.digital/api-client) |
| **🔑 TokenLens** | Client-Side JWT Decoder, RS256/HS256 Verifier & Claim Inspector | [grassroot.digital/jwt-decoder](https://grassroot.digital/jwt-decoder) |
| **🗂️ JSONLens** | Semantic JSON Tree Diff, Syntax Repair & TypeScript/Go Generator | [grassroot.digital/json-diff](https://grassroot.digital/json-diff) |
| **🎯 RegexForge** | Regular Expression Visualizer, Match Highlighting & Code Exporter | [grassroot.digital/regex-tester](https://grassroot.digital/regex-tester) |
| **🔐 CipherLab** | Cryptographic Hash Generator (SHA-256, MD5), AES-GCM & UUID Studio | [grassroot.digital/hash-generator](https://grassroot.digital/hash-generator) |
| **📄 Pagely** | In-Browser Image to PDF Converter & Multi-Page Layout Studio | [grassroot.digital/image-to-pdf](https://grassroot.digital/image-to-pdf) |
| **📷 PassPorto** | Biometric Passport, Visa & ID Photo Maker with 4×6" Print Sheets | [grassroot.digital/passport-photo-maker](https://grassroot.digital/passport-photo-maker) |

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

MIT License © 2026 [Rajesh Narwal](https://grassroot.digital/#about) • [Grassroot Digital](https://grassroot.digital)
