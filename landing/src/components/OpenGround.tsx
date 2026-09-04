import React, { useState, useEffect } from 'react';
import {
  MessageSquareCode,
  Flame,
  Search,
  Filter,
  ThumbsUp,
  MessageCircle,
  Share2,
  Sparkles,
  PlusCircle,
  X,
  Send,
  CheckCircle2,
  Clock,
  User,
  Tag,
  Bookmark,
  Layers,
  Zap,
  Shield,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Pin,
  FileText,
  CornerDownRight,
  BookOpen,
  Smartphone,
  KeyRound,
  FileCode2,
  Regex,
  Binary,
  ArrowRight,
  Cpu,
  Monitor,
  Lock,
  Wifi,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';

export interface ForumComment {
  id: string;
  author: string;
  role?: string;
  time: string;
  content: string;
  upvotes: number;
}

export interface FeatureSection {
  title: string;
  description: string;
  badge?: string;
  steps?: string[];
  codeSample?: string;
  calloutTip?: string;
}

export interface VisualDiagram {
  type: 'pipeline' | 'architecture' | 'comparison' | 'tree';
  title: string;
  subtitle?: string;
  steps: {
    icon: string;
    title: string;
    subtitle: string;
    color: string;
  }[];
}

export interface ForumPost {
  id: string;
  title: string;
  slug: string;
  author: {
    name: string;
    role: string;
    badge?: string;
    avatarUrl?: string;
  };
  category: 'guides' | 'dispatches' | 'discussions' | 'rfcs' | 'endly' | 'tokenlens' | 'jsonlens' | 'regexforge' | 'cipherlab';
  tags: string[];
  publishedAt: string;
  readTime?: string;
  upvotes: number;
  commentsCount: number;
  isPinned?: boolean;
  isOfficialGuide?: boolean;
  summary: string;
  content: string[];
  diagram?: VisualDiagram;
  features?: FeatureSection[];
  comments: ForumComment[];
}

const INITIAL_POSTS: ForumPost[] = [
  {
    id: 'guide-endly',
    title: 'How to Use Endly: Complete Guide to Local API Testing & Wi-Fi Mobile Proxy Interception',
    slug: 'how-to-use-endly-api-client-mobile-proxy',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Official Guide',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'endly',
    tags: ['Endly', 'User Guide', 'Mobile Interceptor', 'API Testing', 'How-To'],
    publishedAt: 'Today',
    readTime: '7 min read',
    upvotes: 0,
    commentsCount: 0,
    isPinned: true,
    isOfficialGuide: true,
    summary:
      'Learn how to build REST/GraphQL requests, manage environment variables, and intercept live HTTP/HTTPS traffic from physical iOS & Android devices over Wi-Fi without cloud leaks.',
    diagram: {
      type: 'pipeline',
      title: 'Endly Zero-Cloud Mobile Interception & Dispatch Architecture',
      subtitle: 'Traffic flows strictly on your local LAN without touching third-party proxy clouds',
      steps: [
        {
          icon: 'Smartphone',
          title: 'Physical iOS / Android',
          subtitle: 'Set Wi-Fi HTTP Proxy to your workstation IP',
          color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
        },
        {
          icon: 'Wifi',
          title: 'Local Wi-Fi Daemon',
          subtitle: 'Native TCP listener handles TLS termination',
          color: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30',
        },
        {
          icon: 'Zap',
          title: 'Endly Workspace Studio',
          subtitle: 'Live request logs, header editing & mock rules',
          color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
        },
        {
          icon: 'Shield',
          title: 'Target Backend API',
          subtitle: 'Direct TCP dispatch bypasses Zscaler & VPN blocks',
          color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
        },
      ],
    },
    content: [
      'Endly is an ultra-fast, local-first API client designed to replace cloud-dependent tools like Postman and Insomnia while packing a built-in mobile network traffic interceptor.',
      'Unlike traditional proxies that require complex root daemons or cloud relay servers, Endly operates entirely on your local machine, keeping proprietary API tokens, authorization headers, and confidential customer payloads strictly on your device.',
    ],
    features: [
      {
        title: '1. Building & Executing API Requests (REST, GraphQL, Raw HTTP)',
        description:
          'Quickly compose requests with method selectors (GET, POST, PUT, PATCH, DELETE), custom headers, query params, and JSON/Form-Data payloads. Endly provides syntax highlighting, auto-formatting, and instant response time metrics.',
        steps: [
          'Click New Request (+) in your workspace sidebar.',
          'Choose your HTTP Method and enter your API endpoint URL.',
          'Add custom headers or authorization tokens under the Headers & Auth tabs.',
          'Click Send (⚡) to execute the request with zero CORS restrictions.',
        ],
        calloutTip: 'Pro-Tip: Use keyboard shortcut ⌘ + Enter (or Ctrl + Enter) to instantly dispatch requests.',
      },
      {
        title: '2. Setting Up Wi-Fi Mobile Proxy for Physical iOS & Android Devices',
        description:
          'Inspect live API calls dispatched by mobile apps running on physical test devices without USB cables or ADB port-forwarding commands.',
        steps: [
          'Open Endly Desktop and click Mobile Interceptor (📱) in the top right header.',
          'Start the Proxy Server (default port: 8080). Note your workstation’s LAN IP (e.g. 192.168.1.55).',
          'On your iPhone or Android, go to Wi-Fi Settings → Configure Proxy → Manual.',
          'Enter your computer IP and Port 8080.',
          'Download and trust Endly’s generated CA Certificate on your device to inspect HTTPS traffic.',
        ],
        calloutTip: 'All certificates are generated locally per machine and never shared across networks.',
      },
      {
        title: '3. Environment Variables & Request Chaining',
        description:
          'Create environment profiles (Development, Staging, Production) with dynamic variables like {{BASE_URL}} and {{AUTH_TOKEN}}. Extract values from previous responses and inject them into subsequent calls automatically.',
      },
      {
        title: '4. Zero-Cloud Workspaces & Local JSON Export',
        description:
          'Export your entire collection or environment vault into standard JSON format to share with teammates via private Git repositories without creating remote SaaS accounts.',
      },
    ],
    comments: [],
  },
  {
    id: 'guide-tokenlens',
    title: 'How to Use TokenLens: Client-Side WebCrypto JWT Debugging & Signature Studio',
    slug: 'how-to-use-tokenlens-jwt-debugger',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Official Guide',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'tokenlens',
    tags: ['TokenLens', 'User Guide', 'JWT', 'Security', 'WebCrypto'],
    publishedAt: 'Today',
    readTime: '6 min read',
    upvotes: 0,
    commentsCount: 0,
    isPinned: true,
    isOfficialGuide: true,
    summary:
      'Step-by-step guide to decoding JWTs, verifying RS256/ES256/HS256 signatures with JWKS public keys, and inspecting token claims without cloud leaks.',
    diagram: {
      type: 'pipeline',
      title: 'TokenLens 100% Client-Side WebCrypto Pipeline',
      subtitle: 'All cryptographic hashing and signature validation runs inside window.crypto.subtle in your browser RAM',
      steps: [
        {
          icon: 'KeyRound',
          title: 'Paste Raw JWT',
          subtitle: 'Header.Payload.Signature formatted token',
          color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
        },
        {
          icon: 'Cpu',
          title: 'W3C WebCrypto API',
          subtitle: 'Local browser cryptographic parsing',
          color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
        },
        {
          icon: 'Shield',
          title: 'Signature Verification',
          subtitle: 'RS256, ES256, HS256 verification with JWKS/PEM',
          color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
          icon: 'Clock',
          title: 'Claim Timeline & Diff',
          subtitle: 'Live exp timers, timezone translation & payload editor',
          color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
        },
      ],
    },
    content: [
      'TokenLens is an offline-capable, client-side JWT (JSON Web Token) inspection and signature verification studio built for security engineers and developers.',
      'Unlike legacy tools like jwt.io that may transmit tokens over network websockets or track claims, TokenLens executes 100% in local memory using the browser WebCrypto API.',
    ],
    features: [
      {
        title: '1. Zero-Cloud JWT Decoding & Claim Inspector',
        description:
          'Instantly splits tokens into Header, Payload, and Signature components with colored visual delimiters. Standard RFC 7519 claims (iss, sub, aud, exp, nbf, iat) are automatically highlighted with human-readable descriptions.',
      },
      {
        title: '2. Offline Asymmetric & Symmetric Signature Verification',
        description:
          'Verify RS256 (RSA SHA-256), ES256 (ECDSA P-256), and HS256 (HMAC SHA-256) signatures without sending your public or private keys to any server.',
        steps: [
          'Paste your encoded JWT into the left editor.',
          'Select your algorithm (RS256, ES256, or HS256).',
          'Paste the public key (PEM format) or provide the Auth0/Okta .well-known/jwks.json public key structure.',
          'TokenLens immediately signals valid or invalid signature status.',
        ],
        calloutTip: 'Your secret keys never leave your device RAM and are cleared when the tab closes.',
      },
      {
        title: '3. Expiration Countdown & Timezone Translation',
        description:
          'Live countdown timer shows exact seconds until token expiration, expired status warnings, and one-click UTC vs Local timezone timestamp comparisons.',
      },
      {
        title: '4. Side-by-Side Token Diff & Mutation Studio',
        description:
          'Modify claims in real time and re-sign tokens with custom secret keys to test how your backend handles modified roles, expired timestamps, or altered user IDs.',
      },
    ],
    comments: [],
  },
  {
    id: 'guide-jsonlens',
    title: 'How to Use JSONLens: Semantic JSON Tree Diffing & TypeScript/Go Type Generation',
    slug: 'how-to-use-jsonlens-diff-type-generator',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Official Guide',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'jsonlens',
    tags: ['JSONLens', 'User Guide', 'JSON Diff', 'TypeScript', 'Go'],
    publishedAt: 'Today',
    readTime: '5 min read',
    upvotes: 0,
    commentsCount: 0,
    isPinned: false,
    isOfficialGuide: true,
    summary:
      'Learn how to compare complex JSON payloads with order-independent semantic diffing, navigate hierarchical JSON trees, and generate type-safe TypeScript & Go models.',
    diagram: {
      type: 'pipeline',
      title: 'JSONLens Semantic Diff & Model Generation Pipeline',
      subtitle: 'Order-independent comparison with instant type generation',
      steps: [
        {
          icon: 'FileCode2',
          title: 'Input Raw Payloads',
          subtitle: 'Paste JSON A & JSON B into split panes',
          color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
        },
        {
          icon: 'Layers',
          title: 'Semantic AST Normalizer',
          subtitle: 'Sorts keys and builds property trees in Web Worker',
          color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
        },
        {
          icon: 'Sparkles',
          title: 'Side-by-Side Diff Markers',
          subtitle: 'Highlights added, removed, and modified values',
          color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
          icon: 'Terminal',
          title: 'Type Generator Export',
          subtitle: 'One-click TypeScript interfaces & Go struct code',
          color: 'from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30',
        },
      ],
    },
    content: [
      'JSONLens solves the classic developer pain point of comparing API responses where key ordering differences create thousands of false positive diffs in standard text comparison tools.',
    ],
    features: [
      {
        title: '1. Semantic (Order-Independent) JSON Diffing',
        description:
          'JSONLens parses payloads into semantic Abstract Syntax Trees (ASTs). If object keys are scrambled between two API versions, JSONLens normalizes the structure and only highlights true data additions, deletions, or value modifications.',
      },
      {
        title: '2. Collapsible Hierarchical Tree Navigation',
        description:
          'Switch seamlessly between raw formatted code view and an interactive Tree View. Search within nested arrays, copy specific JSON property paths (e.g. data.users[0].address.city), and collapse large nodes to stay focused.',
      },
      {
        title: '3. Instant Type Generator (TypeScript & Go)',
        description:
          'Transform any valid JSON payload into type-safe models for your codebase in one click.',
        steps: [
          'Paste your sample API response into the editor.',
          'Click the Type Generator tab.',
          'Select TypeScript to generate clean interfaces with optional types, or Go to generate idiomatic structs with `json:"..."` struct tags.',
          'Click Copy Code to paste right into your project.',
        ],
      },
    ],
    comments: [],
  },
  {
    id: 'guide-regexforge',
    title: 'How to Use RegexForge: Visual Regular Expression Testing & Code Snippet Generator',
    slug: 'how-to-use-regexforge-tester',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Official Guide',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'regexforge',
    tags: ['RegexForge', 'User Guide', 'Regex', 'Pattern Matching', 'Code Generation'],
    publishedAt: 'Today',
    readTime: '4 min read',
    upvotes: 0,
    commentsCount: 0,
    isPinned: false,
    isOfficialGuide: true,
    summary:
      'Master regular expression debugging with live visual match highlighting, named capture group tables, and multi-language code generation.',
    diagram: {
      type: 'pipeline',
      title: 'RegexForge Real-Time Evaluation Pipeline',
      subtitle: 'Zero-latency visual regex execution engine',
      steps: [
        {
          icon: 'Regex',
          title: 'Regex Pattern & Flags',
          subtitle: 'Global (g), Case-Insensitive (i), Multiline (m)',
          color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
          icon: 'Zap',
          title: 'Real-Time Match Evaluator',
          subtitle: 'Interactive visual highlighting as you type',
          color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
        },
        {
          icon: 'Layers',
          title: 'Capture Group Table',
          subtitle: 'Named & indexed capture group breakdown',
          color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
        },
        {
          icon: 'Terminal',
          title: 'Multi-Language Snippets',
          subtitle: 'Ready-to-use JavaScript, Python, Go, and Kotlin snippets',
          color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
        },
      ],
    },
    content: [
      'RegexForge is an intuitive, visual regular expression testing workbench. It eliminates guesswork by highlighting matches in real time, explaining token syntax, and extracting capture groups.',
    ],
    features: [
      {
        title: '1. Visual Real-Time Syntax Highlighting',
        description:
          'Type regular expressions and see matches highlighted immediately in your test strings with distinct colors for alternating matches.',
      },
      {
        title: '2. Named & Indexed Capture Group Table',
        description:
          'Inspect matches broken down by full match, capture group 1, group 2, and named groups (?<group_name>...) in a clean structured table with character start/end index positions.',
      },
      {
        title: '3. Pre-Built Pattern Library',
        description:
          'Access tested production patterns for Email validation, UUID v4, SemVer, ISO 8601 timestamps, IPv4/IPv6 addresses, URLs, and phone numbers in one click.',
      },
      {
        title: '4. Multi-Language Code Snippet Generator',
        description:
          'Generate battle-tested boilerplate code to evaluate your regex in JavaScript/TypeScript, Python (re module), Go (regexp package), or Kotlin/Java (Regex class).',
      },
    ],
    comments: [],
  },
  {
    id: 'guide-cipherlab',
    title: 'How to Use CipherLab: 100% Client-Side Cryptographic Hashing, AES-GCM & Encoding Matrix',
    slug: 'how-to-use-cipherlab-crypto-studio',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Official Guide',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'cipherlab',
    tags: ['CipherLab', 'User Guide', 'Cryptography', 'AES-GCM', 'Hashing'],
    publishedAt: 'Today',
    readTime: '4 min read',
    upvotes: 0,
    commentsCount: 0,
    isPinned: false,
    isOfficialGuide: true,
    summary:
      'Learn how to compute SHA-256/SHA-512 hashes, HMAC signatures, AES-256-GCM encryption, and Base64/Hex matrix conversions in browser RAM.',
    diagram: {
      type: 'pipeline',
      title: 'CipherLab Client-Side WebCrypto Security Pipeline',
      subtitle: 'Zero data exfiltration — all cryptography computed via window.crypto.subtle',
      steps: [
        {
          icon: 'Lock',
          title: 'Input Plaintext Secret',
          subtitle: 'Strings, API keys, passwords, or binary data',
          color: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
        },
        {
          icon: 'Cpu',
          title: 'WebCrypto Engine',
          subtitle: 'Native hardware-accelerated browser crypto',
          color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
        },
        {
          icon: 'Shield',
          title: 'AES-256-GCM / HMAC / SHA',
          subtitle: 'Military-grade encryption and hash generation',
          color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
        },
        {
          icon: 'Binary',
          title: 'Encoding Conversion Matrix',
          subtitle: 'Hex, Base64, Base64URL, Binary & URL Encoded',
          color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
        },
      ],
    },
    content: [
      'CipherLab is an offline cryptographic workbench designed for developers needing quick hash verification, encryption testing, and multi-format encoding conversions without uploading sensitive keys to cloud servers.',
    ],
    features: [
      {
        title: '1. Cryptographic Hash Calculation (SHA-256, SHA-512, SHA-1, MD5)',
        description:
          'Compute checksums and hashes simultaneously across all major digest algorithms. Compare computed hashes with expected checksums to verify file or payload integrity.',
      },
      {
        title: '2. HMAC Signature Generator',
        description:
          'Generate keyed-hash message authentication codes (HMAC-SHA256, HMAC-SHA512) for webhook verification and signature testing (e.g. Stripe, GitHub, AWS webhooks).',
      },
      {
        title: '3. AES-256-GCM Symmetric Encryption & Decryption',
        description:
          'Encrypt sensitive text payloads using AES-GCM with dynamic initialization vectors (IV) and authentication tags, and decrypt encrypted ciphertext directly in browser memory.',
      },
      {
        title: '4. Multi-Encoding Conversion Matrix',
        description:
          'Convert any string or binary sequence across UTF-8, Hexadecimal, Base64, Base64URL, Binary bits, and URL encoding simultaneously.',
      },
    ],
    comments: [],
  },
  {
    id: 'dispatch-mobile-arch',
    title: 'Architectural Blueprint: Intercepting iOS & Android Wi-Fi Traffic Locally Without Cloud Daemons',
    slug: 'intercepting-mobile-traffic-locally-endly',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Architectural Dispatch',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'dispatches',
    tags: ['Mobile Architecture', 'Endly', 'Networking', 'Reverse Proxy', 'Kotlin'],
    publishedAt: 'Yesterday',
    readTime: '6 min read',
    upvotes: 0,
    commentsCount: 0,
    isPinned: false,
    summary:
      'A technical breakdown of how Endly provisions an embedded, lightweight Wi-Fi proxy server on your local machine to capture raw HTTP/HTTPS payloads from physical mobile devices with zero external cloud dependencies.',
    content: [
      'Debugging network requests from physical iOS and Android devices in corporate environments has traditionally been frustrating. Most tools either require cumbersome USB tethering daemons, cloud tunnels with bandwidth limits, or invasive root certificates that trip mobile device management (MDM) policies.',
      'In Endly, we engineered a native local-first proxy daemon that spins up a lightweight TCP server bound to your local network adapter. When you route your mobile device Wi-Fi proxy settings to your workstation’s IP address, Endly performs TLS termination using a dynamically generated, locally-isolated CA certificate.',
      'Key Architectural Benefits:',
      '1. Zero Telemetry & Cloud Exfiltration: Intercepted auth tokens, session headers, and internal backend payloads stay strictly in your computer’s RAM or local workspace file.',
      '2. Corporate Firewall & VPN Immunity: Because all traffic stays on your local subnet (192.168.x.x / 10.x.x.x), aggressive corporate proxies like Zscaler and Cisco AnyConnect never block or throttle mobile inspection.',
      '3. Live Mocking & Breakpoint Injection: The local daemon can intercept incoming requests and return synthetic JSON fixtures before reaching downstream staging servers.',
    ],
    comments: [],
  },
  {
    id: 'dispatch-zero-telemetry',
    title: 'Why Zero Telemetry and 100% Client-Side WebCrypto Outperform SaaS Developer Tools',
    slug: 'zero-telemetry-client-side-webcrypto',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Philosophy',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'dispatches',
    tags: ['Security', 'TokenLens', 'WebCrypto', 'Privacy', 'Compliance'],
    publishedAt: '3 days ago',
    readTime: '5 min read',
    upvotes: 0,
    commentsCount: 0,
    isPinned: false,
    summary:
      'How we use the W3C WebCrypto API in TokenLens and CipherLab to verify RS256, ES256, and HMAC signatures directly in browser memory without sending a single byte to an external server.',
    content: [
      'In recent years, standard developer utilities (JWT decoders, JSON diff viewers, hash calculators) have morphed into bloated cloud services requiring logins and silently harvesting developer input for training or analytics.',
      'For engineers working in fintech, defense, healthcare, or strictly regulated enterprises, pasting a JWT containing internal user IDs or private RSA keys into a web tool is a severe compliance violation.',
      'In the Grassroot Digital suite, we adopted a strict architectural mandate: 100% of compute must execute in the browser using the W3C WebCrypto API (window.crypto.subtle) or in native standalone binaries. When you decode or verify a JWT in TokenLens, your keys never touch a network socket.',
    ],
    comments: [],
  },
  {
    id: 'rfc-websocket-sse',
    title: 'RFC 001: WebSocket & Server-Sent Events (SSE) Live Frame Interception in Endly',
    slug: 'rfc-websocket-sse-frame-interception',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'RFC Proposal',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'rfcs',
    tags: ['RFC', 'Endly', 'WebSockets', 'SSE', 'Feature Proposal'],
    publishedAt: '2 days ago',
    readTime: '4 min read',
    upvotes: 0,
    commentsCount: 0,
    isPinned: false,
    summary:
      'Proposing bidirectional WebSocket frame inspection, message filtering, and manual frame injection for Endly v1.1. Share your feedback and RFC votes.',
    content: [
      'As modern applications increasingly adopt WebSocket streaming for real-time notifications and Server-Sent Events (SSE) for LLM chat streaming, standard REST inspectors fall short.',
      'We are drafting the specification for Endly v1.1 to introduce dedicated streaming tabs with:',
      '• Live frame timeline (Text, Binary, Ping/Pong frames)',
      '• JSON structure auto-detection for WS payloads',
      '• Custom frame dispatch tool to inject synthetic messages into open WS connections',
      '• Local filter by opcode or payload substring regex',
      'Please leave your thoughts on what features matter most for your real-time debugging workflow!',
    ],
    comments: [],
  },
];

interface OpenGroundProps {
  onBackToHome: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const OpenGround: React.FC<OpenGroundProps> = ({ onBackToHome, onSelectProduct }) => {
  const [userUpvotedPostIds, setUserUpvotedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('grassroot_user_upvotes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [posts, setPosts] = useState<ForumPost[]>(() => {
    const saved = localStorage.getItem('grassroot_openground_posts_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_POSTS.length) {
          return parsed;
        }
      } catch {
        // Fall back to clean INITIAL_POSTS
      }
    }
    return INITIAL_POSTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // New Post Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<ForumPost['category']>('discussions');
  const [newPostTags, setNewPostTags] = useState('');
  const [newPostSummary, setNewPostSummary] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');

  // Persist real posts and user upvotes
  useEffect(() => {
    localStorage.setItem('grassroot_openground_posts_v3', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('grassroot_user_upvotes', JSON.stringify(userUpvotedPostIds));
  }, [userUpvotedPostIds]);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'guides'
        ? post.isOfficialGuide
        : selectedCategory === 'dispatches'
        ? post.category === 'dispatches'
        : selectedCategory === 'rfcs'
        ? post.category === 'rfcs'
        : selectedCategory === 'discussions'
        ? post.category === 'discussions'
        : post.category === selectedCategory || post.tags.map((t) => t.toLowerCase()).includes(selectedCategory);

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleUpvotePost = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isAlreadyUpvoted = userUpvotedPostIds.includes(postId);
    const delta = isAlreadyUpvoted ? -1 : 1;

    setUserUpvotedPostIds((prev) =>
      isAlreadyUpvoted ? prev.filter((id) => id !== postId) : [...prev, postId]
    );

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, upvotes: Math.max(0, p.upvotes + delta) } : p
      )
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev ? { ...prev, upvotes: Math.max(0, prev.upvotes + delta) } : null
      );
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newCommentText.trim()) return;

    const newComment: ForumComment = {
      id: `comment-${Date.now()}`,
      author: commenterName.trim() || 'Anonymous Engineer',
      role: 'Community Member',
      time: 'Just now',
      content: newCommentText.trim(),
      upvotes: 0,
    };

    const updatedPosts = posts.map((p) => {
      if (p.id === selectedPost.id) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, newComment],
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    setSelectedPost((prev) =>
      prev
        ? {
            ...prev,
            commentsCount: prev.commentsCount + 1,
            comments: [...prev.comments, newComment],
          }
        : null
    );

    setNewCommentText('');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostSummary.trim()) return;

    const tagsArray = newPostTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      title: newPostTitle.trim(),
      slug: newPostTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
      author: {
        name: newPostAuthor.trim() || 'Community Engineer',
        role: 'Developer Contributor',
        badge: 'Community',
      },
      category: newPostCategory,
      tags: tagsArray.length > 0 ? tagsArray : ['Community', 'Discussion'],
      publishedAt: 'Just now',
      readTime: '3 min read',
      upvotes: 0,
      commentsCount: 0,
      isPinned: false,
      summary: newPostSummary.trim(),
      content: newPostContent
        .split('\n\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0),
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setIsNewPostModalOpen(false);
    setNewPostTitle('');
    setNewPostTags('');
    setNewPostSummary('');
    setNewPostContent('');
    setNewPostAuthor('');
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'KeyRound':
        return <KeyRound className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Clock':
        return <Clock className="w-5 h-5" />;
      case 'FileCode2':
        return <FileCode2 className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5" />;
      case 'Regex':
        return <Regex className="w-5 h-5" />;
      case 'Lock':
        return <Lock className="w-5 h-5" />;
      case 'Binary':
        return <Binary className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const categories = [
    { id: 'all', label: 'All Knowledge & Articles', icon: Layers },
    { id: 'guides', label: '📖 User Guides & How-To', icon: BookOpen },
    { id: 'endly', label: '⚡ Endly API & Proxy', icon: Zap },
    { id: 'tokenlens', label: '🔑 TokenLens JWT', icon: KeyRound },
    { id: 'jsonlens', label: '🗂️ JSONLens Diff', icon: FileCode2 },
    { id: 'regexforge', label: '🎯 RegexForge', icon: Regex },
    { id: 'cipherlab', label: '🔐 CipherLab Crypto', icon: Lock },
    { id: 'dispatches', label: '🏗️ Tech Dispatches', icon: FileText },
    { id: 'rfcs', label: '💡 Feature RFCs', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-background-primary text-text-primary pt-24 pb-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-border/60 mb-8">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-background-secondary hover:bg-background-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Main Ecosystem</span>
          </button>

          <button
            onClick={() => setIsNewPostModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Discussion / Submit RFC</span>
          </button>
        </div>

        {/* Forum Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold tracking-wide uppercase">
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span>Open Ground • Engineering Publication & Interactive Guides</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight text-text-primary">
            Open Ground{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              Knowledge Hub
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Illustrated how-to user guides, architectural deep-dives, and community feature discussions for the Grassroot Digital suite.
          </p>
        </div>

        {/* Search & Channel Tabs Bar */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user guides, mobile proxy tutorials, WebCrypto JWT verification..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-background-secondary border border-border focus:border-accent text-sm text-text-primary placeholder-text-muted focus:outline-none shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-background-tertiary text-text-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-start sm:justify-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                    isActive
                      ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                      : 'bg-background-secondary hover:bg-background-elevated text-text-secondary hover:text-text-primary border-border'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Post Grid / List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-background-secondary border border-border space-y-3">
                <MessageCircle className="w-8 h-8 text-text-muted mx-auto" />
                <h3 className="font-heading font-bold text-lg text-text-primary">No articles found</h3>
                <p className="text-xs text-text-secondary">
                  No articles or guides matched your search query. Try resetting filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group p-6 rounded-3xl bg-background-secondary hover:bg-background-secondary/85 border border-border hover:border-accent/40 shadow-md hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                >
                  {/* Top Badge: Official Guide / Pinned */}
                  <div className="flex items-center space-x-2 mb-3">
                    {post.isOfficialGuide ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-mono font-bold border border-orange-500/30">
                        <BookOpen className="w-3 h-3" />
                        <span>INTERACTIVE USER GUIDE & ARCHITECTURE</span>
                      </span>
                    ) : post.isPinned ? (
                      <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-amber-400">
                        <Pin className="w-3.5 h-3.5 fill-amber-400" />
                        <span>PINNED ARCHITECTURAL DISPATCH</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Top Metadata Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5">
                      {post.author.avatarUrl ? (
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author.name}
                          className="w-7 h-7 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                          {post.author.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-text-primary">
                            {post.author.name}
                          </span>
                          {post.author.badge && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {post.author.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-text-muted">{post.author.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-text-muted">
                      <span>{post.publishedAt}</span>
                      {post.readTime && <span>• {post.readTime}</span>}
                    </div>
                  </div>

                  {/* Post Title */}
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-text-primary group-hover:text-accent transition-colors leading-snug mb-2">
                    {post.title}
                  </h3>

                  {/* Post Summary */}
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2 mb-4">
                    {post.summary}
                  </p>

                  {/* Visual Diagram Preview Snippet if present */}
                  {post.diagram && (
                    <div className="p-3.5 rounded-2xl bg-background-primary/70 border border-border/70 mb-4 hidden sm:block">
                      <div className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                        <Sparkles className="w-3 h-3 text-orange-400" />
                        <span>Workflow Diagram: {post.diagram.title}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {post.diagram.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl bg-gradient-to-b ${step.color} border flex flex-col justify-between`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              {renderIcon(step.icon)}
                              <span className="text-[9px] font-mono opacity-60">0{idx + 1}</span>
                            </div>
                            <div className="text-[10px] font-bold truncate">{step.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags & Action Metrics Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-background-elevated text-text-muted border border-border/50"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-text-muted">
                      <button
                        onClick={(e) => handleUpvotePost(post.id, e)}
                        className={`flex items-center space-x-1.5 transition-all p-1.5 rounded-lg cursor-pointer ${
                          userUpvotedPostIds.includes(post.id)
                            ? 'text-orange-400 bg-orange-500/15 font-bold'
                            : 'text-text-muted hover:text-orange-400 hover:bg-background-elevated'
                        }`}
                        title={userUpvotedPostIds.includes(post.id) ? 'Remove upvote' : 'Upvote discussion'}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${userUpvotedPostIds.includes(post.id) ? 'fill-orange-400' : ''}`} />
                        <span className="font-semibold">{post.upvotes}</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="font-semibold">{post.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Sidebar: Guide Index & Quick Links */}
          <div className="lg:col-span-4 space-y-6">
            {/* Guide Quick Navigator */}
            <div className="p-6 rounded-3xl bg-background-secondary border border-border space-y-4 shadow-md">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">
                    Product Feature Guides
                  </h4>
                  <p className="text-[11px] text-text-muted">Step-by-step documentation</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {INITIAL_POSTS.filter((p) => p.isOfficialGuide).map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => setSelectedPost(guide)}
                    className="w-full text-left p-2.5 rounded-xl bg-background-tertiary/60 hover:bg-background-elevated border border-border/70 hover:border-orange-500/40 flex items-center justify-between text-text-secondary hover:text-text-primary transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <ChevronRight className="w-3.5 h-3.5 text-orange-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      <span className="truncate font-semibold">{guide.tags[0]} Guide</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted shrink-0">
                      {guide.readTime}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Overview Card */}
            <div className="p-6 rounded-3xl bg-background-secondary border border-border space-y-4 shadow-md">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">
                    About Open Ground
                  </h4>
                  <p className="text-[11px] text-text-muted">The Grassroot Engineering Forum</p>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Open Ground is our engineering knowledge publication where we break down architectural patterns, write user guides, and discuss RFC proposals with zero cloud marketing fluff.
              </p>

              <button
                onClick={() => setIsNewPostModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-background-elevated hover:bg-background-tertiary border border-border hover:border-accent text-xs font-bold text-text-primary transition-all text-center block cursor-pointer"
              >
                Submit Discussion / RFC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Detail Modal / Reader View */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-4xl max-h-[92vh] bg-background-secondary border border-border rounded-3xl shadow-2xl overflow-y-auto flex flex-col text-text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Sticky Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary/95 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-accent uppercase">
                  {selectedPost.category.toUpperCase()}
                </span>
                <span className="text-text-muted">•</span>
                <span className="text-xs text-text-muted">{selectedPost.publishedAt}</span>
                {selectedPost.readTime && (
                  <>
                    <span className="text-text-muted">•</span>
                    <span className="text-xs text-text-muted">{selectedPost.readTime}</span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpvotePost(selectedPost.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userUpvotedPostIds.includes(selectedPost.id)
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : 'bg-background-elevated hover:bg-background-tertiary text-text-secondary hover:text-text-primary'
                  }`}
                  title={userUpvotedPostIds.includes(selectedPost.id) ? 'Remove upvote' : 'Upvote discussion'}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${userUpvotedPostIds.includes(selectedPost.id) ? 'fill-white' : ''}`} />
                  <span>{selectedPost.upvotes}</span>
                </button>

                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 rounded-xl hover:bg-background-tertiary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* Author & Header */}
              <div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-text-primary leading-tight mb-4">
                  {selectedPost.title}
                </h2>

                <div className="flex items-center space-x-3">
                  {selectedPost.author.avatarUrl ? (
                    <img
                      src={selectedPost.author.avatarUrl}
                      alt={selectedPost.author.name}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm">
                      {selectedPost.author.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-text-primary flex items-center space-x-2">
                      <span>{selectedPost.author.name}</span>
                      {selectedPost.author.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {selectedPost.author.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-muted">{selectedPost.author.role}</div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedPost.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-2.5 py-1 rounded-lg bg-background-elevated text-text-secondary border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Visual Interactive Graphic Diagram */}
              {selectedPost.diagram && (
                <div className="p-6 rounded-3xl bg-background-primary border-2 border-border/80 space-y-4">
                  <div>
                    <div className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{selectedPost.diagram.title}</span>
                    </div>
                    {selectedPost.diagram.subtitle && (
                      <p className="text-xs text-text-muted mt-1">{selectedPost.diagram.subtitle}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {selectedPost.diagram.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl bg-gradient-to-b ${step.color} border flex flex-col justify-between space-y-3 relative overflow-hidden`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-xl bg-background-primary/50 shrink-0">
                            {renderIcon(step.icon)}
                          </div>
                          <span className="text-xs font-mono font-bold opacity-60">
                            Step 0{idx + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-heading font-bold text-sm text-text-primary">
                            {step.title}
                          </div>
                          <div className="text-[11px] text-text-secondary mt-1 leading-snug">
                            {step.subtitle}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Article Paragraphs */}
              <div className="space-y-4 text-text-secondary text-sm sm:text-base leading-relaxed">
                {selectedPost.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Structured Feature Sections with Steps */}
              {selectedPost.features && selectedPost.features.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-border/70">
                  <h3 className="font-heading font-extrabold text-xl text-text-primary flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-orange-400" />
                    <span>Feature Breakdown & Step-by-Step Instructions</span>
                  </h3>

                  <div className="space-y-4">
                    {selectedPost.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-background-primary border border-border/80 space-y-3"
                      >
                        <h4 className="font-heading font-bold text-base text-text-primary">
                          {feat.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                          {feat.description}
                        </p>

                        {feat.steps && feat.steps.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <div className="text-xs font-mono font-bold text-text-muted uppercase">
                              Steps to execute:
                            </div>
                            <ol className="space-y-1.5 text-xs text-text-secondary list-decimal list-inside">
                              {feat.steps.map((step, sIdx) => (
                                <li key={sIdx} className="leading-relaxed">
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {feat.calloutTip && (
                          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 flex items-start space-x-2">
                            <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                            <span>{feat.calloutTip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discussion / Comments Section */}
              <div className="space-y-6 pt-6 border-t border-border/70">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-lg text-text-primary flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-accent" />
                    <span>Discussion & Replies ({selectedPost.comments.length})</span>
                  </h4>
                </div>

                {/* Comment Form */}
                <form
                  onSubmit={handleAddComment}
                  className="space-y-3 p-5 rounded-2xl bg-background-primary/80 border border-border"
                >
                  <div className="text-xs font-bold text-text-primary">Join the Discussion:</div>
                  <input
                    type="text"
                    value={commenterName}
                    onChange={(e) => setCommenterName(e.target.value)}
                    placeholder="Your Name / Title (e.g. Alex • Mobile Dev)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background-secondary border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                  <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Share your feedback, ask questions, or discuss this feature guide..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background-secondary border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Reply</span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3">
                  {selectedPost.comments.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-4">
                      No replies yet. Be the first to start the conversation!
                    </p>
                  ) : (
                    selectedPost.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 rounded-2xl bg-background-secondary border border-border space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-text-primary">{comment.author}</span>
                            {comment.role && (
                              <span className="text-[10px] text-text-muted">• {comment.role}</span>
                            )}
                          </div>
                          <span className="text-[10px] text-text-muted">{comment.time}</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Post Modal */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-xl bg-background-secondary border border-border rounded-3xl shadow-2xl p-6 sm:p-8 text-text-primary space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-text-primary">
                    Start a New Discussion / RFC
                  </h3>
                  <p className="text-[11px] text-text-muted">Post to Open Ground community</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewPostModalOpen(false)}
                className="p-2 rounded-xl hover:bg-background-tertiary text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Your Name / Handle:
                </label>
                <input
                  type="text"
                  required
                  value={newPostAuthor}
                  onChange={(e) => setNewPostAuthor(e.target.value)}
                  placeholder="e.g. Jordan Lee (Systems Eng)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background-primary border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">Channel:</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background-primary border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="discussions">General Discussion</option>
                    <option value="rfcs">Feature RFC / Proposal</option>
                    <option value="endly">Endly API & Proxy</option>
                    <option value="tokenlens">TokenLens JWT</option>
                    <option value="jsonlens">JSONLens Diff</option>
                    <option value="regexforge">RegexForge</option>
                    <option value="cipherlab">CipherLab Crypto</option>
                    <option value="dispatches">Technical Dispatch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Tags (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    placeholder="e.g. Endly, Proxy, RFC, Security"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background-primary border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Topic Title:</label>
                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="e.g. RFC: Adding HAR File Export to Mobile Interceptor"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background-primary border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Short Summary:
                </label>
                <input
                  type="text"
                  required
                  value={newPostSummary}
                  onChange={(e) => setNewPostSummary(e.target.value)}
                  placeholder="Brief 1-2 sentence overview of the topic"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background-primary border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Discussion Content:
                </label>
                <textarea
                  rows={4}
                  required
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Write detailed background, code snippets, or rationale for this RFC..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background-primary border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-background-elevated text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/25 cursor-pointer"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
