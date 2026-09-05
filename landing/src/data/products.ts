import { ProductItem } from '../types';

export const PRODUCTS: ProductItem[] = [
  {
    id: 'endly',
    name: 'Endly',
    category: 'api',
    tagline: 'Modern Cross-Platform API Client & Mobile Interceptor',
    description:
      'A lightning-fast, zero-cloud Postman alternative with built-in Wi-Fi mobile proxy interception, dynamic environment cascading, automated collection runner, and 100% browser-local storage.',
    status: 'live',
    badgeText: 'LIVE NOW',
    iconName: 'Zap',
    accentColor: '#f97316',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    url: 'https://endly.grassroot.digital',
    features: [
      {
        title: 'Mobile Proxy Interceptor',
        description: 'Intercept, inspect, and live-mock HTTP/HTTPS traffic from physical iOS & Android devices over local Wi-Fi.',
      },
      {
        title: 'Zero-Cloud & 100% Local',
        description: 'Requests, secrets, and auth tokens are stored strictly on your machine. Zero cloud telemetry.',
      },
      {
        title: 'Multi-Environment Cascading',
        description: 'Global and per-workspace environment variables with instant `{{variable}}` substitution.',
      },
      {
        title: 'Automated Collection Runner',
        description: 'Run sequential API workflows with assertions, real-time latency graphs, and exportable test reports.',
      },
    ],
    previewMockup: {
      type: 'api-client',
      tags: ['REST', 'GraphQL', 'Mobile Proxy', 'Zero-Cloud', 'macOS & Windows'],
      sampleCode: `POST https://api.grassroot.digital/v1/checkout
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "orderId": "ORD-98421",
  "amount": 149.00,
  "currency": "USD"
}`,
      sampleResult: `HTTP/2 200 OK  •  38ms  •  1.42 KB
{
  "status": "success",
  "transactionId": "txn_8921a8f",
  "verifiedBy": "Endly-Client"
}`,
    },
    githubUrl: 'https://github.com/rjnarwal/endly',
    downloads: {
      macArmUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.1/Endly_1.0.1_aarch64.dmg',
      macIntelUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.1/Endly_1.0.1_x64.dmg',
      winUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.1/Endly_1.0.1_x64-setup.exe',
      linuxUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.1/Endly_1.0.1_amd64.AppImage',
      releasesUrl: 'https://github.com/rjnarwal/endly/releases',
    },
    actions: {
      primaryLabel: 'Launch Endly',
      primaryUrl: 'https://endly.grassroot.digital',
      isExternal: true,
      secondaryLabel: 'Download Desktop (Mac / Win)',
      secondaryUrl: 'https://github.com/rjnarwal/endly/releases',
    },
  },
  {
    id: 'jwt-decoder',
    name: 'TokenLens (JWT Studio)',
    category: 'security',
    tagline: 'Client-Side JWT Parser, Claim Inspector & WebCrypto Verifier',
    description:
      'Inspect, edit, and verify JSON Web Tokens entirely within your browser. Check expiry timelines, validate RS256/HS256/ES256 signatures with WebCrypto, and debug custom claims with zero cloud leaks.',
    status: 'live',
    badgeText: 'LIVE NOW',
    iconName: 'KeyRound',
    accentColor: '#8b5cf6',
    gradient: 'from-purple-500 via-indigo-500 to-violet-600',
    url: 'https://tokenlens.grassroot.digital',
    features: [
      {
        title: 'WebCrypto Verification & Signing',
        description: 'Verify HMAC, RSA, and ECDSA signatures locally via WebCrypto API without transmitting secret keys.',
      },
      {
        title: 'Interactive Expiration Timeline',
        description: 'Visual countdown timer and timestamp converter for `exp`, `nbf`, and `iat` claims.',
      },
      {
        title: 'Header & Payload Two-Way Editor',
        description: 'Edit claims in real time and immediately re-encode or sign new tokens for testing.',
      },
      {
        title: 'Side-by-Side Token Diff',
        description: 'Compare claims and header differences between two tokens with visual added/removed markers.',
      },
    ],
    previewMockup: {
      type: 'jwt-decoder',
      tags: ['JWT', 'RS256/HS256/ES256', 'WebCrypto', 'Zero-Cloud'],
      sampleCode: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJ1c3JfODk0MiIsIm5hbWUiOiJBbGV4Iiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzM1NzA4ODAwLCJleHAiOjIwODA4ODY0MDB9.
jM8lG3Oq8zI0i-y2tB1mD4kP7xV9nL2jE6cT3rF1wQk`,
      sampleResult: `// WebCrypto: Signature Verified (HS256)
{
  "sub": "usr_8942",
  "name": "Alex",
  "roles": ["admin"],
  "status": "Token Active (Expires in 10+ yrs)"
}`,
    },
    githubUrl: 'https://github.com/rjnarwal/tokenlens',
    actions: {
      primaryLabel: 'Launch TokenLens',
      primaryUrl: 'https://tokenlens.grassroot.digital',
      isExternal: true,
    },
  },
  {
    id: 'json-diff',
    name: 'JSONLens (Diff & Studio)',
    category: 'formatters',
    tagline: 'Semantic Side-by-Side JSON Comparator, Beautifier & Type Generator',
    description:
      'Compare, validate, and beautify large JSON payloads with semantic tree diffing. Spot added, modified, or missing fields with visual inline highlighting, syntax auto-repair, and TypeScript/Go generators.',
    status: 'live',
    badgeText: 'LIVE NOW',
    iconName: 'FileCode2',
    accentColor: '#06b6d4',
    gradient: 'from-cyan-500 via-teal-500 to-blue-500',
    url: 'https://jsonlens.grassroot.digital',
    features: [
      {
        title: 'Semantic Tree & Line Comparison',
        description: 'Side-by-side and unified diffing highlighting added, removed, and modified properties with statistical metrics.',
      },
      {
        title: 'Inline Syntax Auto-Repair',
        description: 'Auto-correct unquoted keys, trailing commas, and single-quoted strings instantly in browser memory.',
      },
      {
        title: 'Multi-Target Type Generator',
        description: 'Convert JSON to TypeScript interfaces, Go structs, and YAML with one-click copy and download.',
      },
      {
        title: 'Beautifier & Compact Minifier',
        description: 'Configurable indentation (2/4/tabs), key alphabetization, and zero-cloud execution.',
      },
    ],
    previewMockup: {
      type: 'json-diff',
      tags: ['Semantic Diff', 'TypeScript', 'Go Structs', 'YAML', '100% Local'],
      sampleCode: `// Original (v1)
{ "id": 101, "tier": "free", "active": true }

// Modified (v2)
{ "id": 101, "tier": "pro", "active": true, "seats": 5 }`,
      sampleResult: `// Diff Summary: 1 added, 1 modified
~ tier: "free" -> "pro"
+ seats: 5`,
    },
    githubUrl: 'https://github.com/rjnarwal/jsonlens',
    actions: {
      primaryLabel: 'Launch JSONLens',
      primaryUrl: 'https://jsonlens.grassroot.digital',
      isExternal: true,
    },
  },
  {
    id: 'regex-tester',
    name: 'RegexForge (Regex Studio)',
    category: 'utilities',
    tagline: 'Real-Time Regular Expression Visualizer, Parser & Code Generator',
    description:
      'Test and debug regular expressions with live color-coded match highlighting, capture group inspectors, plain-English syntax explanation, substitution studio, and multi-language code generators.',
    status: 'live',
    badgeText: 'LIVE NOW',
    iconName: 'Regex',
    accentColor: '#10b981',
    gradient: 'from-emerald-500 via-teal-500 to-green-600',
    url: 'https://regexforge.grassroot.digital',
    features: [
      {
        title: 'Live Highlight & Group Inspector',
        description: 'Real-time multi-color match highlighting with named and numbered capture groups index breakdown.',
      },
      {
        title: 'Plain-English Syntax Explainer',
        description: 'Explore step-by-step human explanations of anchors, quantifiers, lookarounds, and character sets.',
      },
      {
        title: 'Substitution & Replace Studio',
        description: 'Interactive string replacement testing with dynamic group tokens ($1, $2, $&) and live diff metrics.',
      },
      {
        title: 'Multi-Language Code Generator',
        description: 'Export copy-pasteable regex code for Kotlin (Android), Java, TypeScript, Python, and Go.',
      },
    ],
    previewMockup: {
      type: 'regex-tester',
      tags: ['ECMAScript', 'Capture Groups', 'Substitution', 'Kotlin & Java'],
      sampleCode: `/([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+)/g`,
      sampleResult: `Match 1: "support@grassroot.digital"
• Group 1: "support"
• Group 2: "grassroot.digital"`,
    },
    githubUrl: 'https://github.com/rjnarwal/regexforge',
    actions: {
      primaryLabel: 'Launch RegexForge',
      primaryUrl: 'https://regexforge.grassroot.digital',
      isExternal: true,
    },
  },
  {
    id: 'crypto-studio',
    name: 'CipherLab (Crypto Studio)',
    category: 'utilities',
    tagline: 'Cryptographic Hashes, AES-256-GCM, HMAC, UUID v4/v7 & Encoding Studio',
    description:
      'All-in-one developer toolbox for instant hashing (SHA-256, SHA-512, MD5, CRC32), HMAC signing, WebCrypto AES-256 encryption, Base64/Hex/Binary encoding, and timestamp-ordered UUID v7 generation.',
    status: 'live',
    badgeText: 'LIVE NOW',
    iconName: 'Binary',
    accentColor: '#ec4899',
    gradient: 'from-pink-500 via-rose-500 to-amber-500',
    url: 'https://cipherlab.grassroot.digital',
    features: [
      {
        title: 'Instant Multi-Hash Engine',
        description: 'Compute SHA-256, SHA-512, SHA-384, SHA-1, MD5, and CRC32 in Hex or Base64 with one click.',
      },
      {
        title: 'HMAC & WebCrypto AES-256',
        description: 'Keyed signature verification and military-grade AES-256-GCM authenticated encryption/decryption.',
      },
      {
        title: 'UUID v4 & Time-Ordered UUID v7',
        description: 'Batch generate random UUID v4, database-optimized UUID v7, ULID, and NanoID tokens.',
      },
      {
        title: 'Multi-Format Encoder/Decoder',
        description: 'Bi-directional conversions between Text, Base64, Base64URL, Hex bytes, Binary octets, and URL encoding.',
      },
    ],
    previewMockup: {
      type: 'crypto-studio',
      tags: ['SHA-256', 'AES-256-GCM', 'HMAC', 'UUID v7', 'Base64'],
      sampleCode: `String: "Grassroot Digital - Local First"`,
      sampleResult: `SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
UUID v7: 018df13b-8250-71a2-9442-1e9681145b20
Base64:  R3Jhc3Nyb290IERpZ2l0YWwgLSBMb2NhbCBGaXJzdA==`,
    },
    githubUrl: 'https://github.com/rjnarwal/cipherlab',
    actions: {
      primaryLabel: 'Launch CipherLab',
      primaryUrl: 'https://cipherlab.grassroot.digital',
      isExternal: true,
    },
  },
  {
    id: 'pagely',
    name: 'Pagely (Image to PDF)',
    category: 'utilities',
    tagline: '100% In-Browser Image to PDF Converter & Multi-Page Studio',
    description:
      'Convert JPG, PNG, WebP, SVG, and GIF images into high-resolution multi-page PDF documents. Zero server uploads, custom page layouts (A4, Letter, Legal, Aspect Fit), rotation, and lossless/balanced compression.',
    status: 'live',
    badgeText: 'LIVE NOW',
    iconName: 'Images',
    accentColor: '#f43f5e',
    gradient: 'from-rose-500 via-pink-500 to-red-500',
    url: 'https://pagely.grassroot.digital',
    features: [
      {
        title: '100% Client-Side Privacy',
        description: 'Zero cloud server uploads or bandwidth costs. Confidential documents never leave your browser.',
      },
      {
        title: 'Multi-Page Grid & Reordering',
        description: 'Drag-and-drop batch upload, individual 90° page rotation, and natural alphabetical sorting.',
      },
      {
        title: 'Custom Layouts & Margins',
        description: 'A4, US Letter, US Legal, Poster A3, Aspect Fit, and customizable margin presets.',
      },
      {
        title: 'In-Memory Canvas Compression',
        description: 'Hardware-accelerated offscreen canvas processing with Balanced, High, or Compact output sizes.',
      },
    ],
    previewMockup: {
      type: 'pagely',
      tags: ['JPG/PNG/WebP', 'PDF Studio', '100% Local', 'Zero-Cloud'],
      sampleCode: `// Batch Upload: 3 Images (PNG / WebP / JPG)
Page 1: Architecture_2026.png (1200x800) -> 0°
Page 2: Benchmark_Graph.webp (1920x1080) -> 90°
Page 3: Signature_Scan.jpg (800x600) -> 12mm Margin`,
      sampleResult: `// In-Memory jsPDF Stream Output:
File: "pagely_document.pdf"
Size: 1.42 MB (Balanced 82% Compression)
Status: Compiled in 180ms with 0 bytes uploaded`,
    },
    githubUrl: 'https://github.com/rjnarwal/pagely',
    actions: {
      primaryLabel: 'Launch Pagely',
      primaryUrl: 'https://pagely.grassroot.digital',
      isExternal: true,
    },
  },
];

