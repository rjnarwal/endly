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
} from 'lucide-react';

export interface ForumComment {
  id: string;
  author: string;
  role?: string;
  time: string;
  content: string;
  upvotes: number;
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
  category: 'dispatches' | 'discussions' | 'rfcs' | 'endly' | 'tokenlens' | 'jsonlens';
  tags: string[];
  publishedAt: string;
  readTime?: string;
  upvotes: number;
  commentsCount: number;
  isPinned?: boolean;
  summary: string;
  content: string[];
  comments: ForumComment[];
}

const INITIAL_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    title: 'Architectural Blueprint: Intercepting iOS & Android Wi-Fi Traffic Locally Without Cloud Daemons',
    slug: 'intercepting-mobile-traffic-locally-endly',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Author',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'dispatches',
    tags: ['Mobile Architecture', 'Endly', 'Networking', 'Reverse Proxy', 'Kotlin'],
    publishedAt: 'Yesterday',
    readTime: '6 min read',
    upvotes: 48,
    commentsCount: 9,
    isPinned: true,
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
    comments: [
      {
        id: 'c-1',
        author: 'Marcus Vance',
        role: 'Senior Android Engineer',
        time: '18 hours ago',
        content:
          'This solves our exact issue with Zscaler blocking Charles Proxy on corporate MacBooks. Tested Endly over the office Wi-Fi with a Samsung S23 and intercepting gRPC/JSON was instantaneous.',
        upvotes: 12,
      },
      {
        id: 'c-2',
        author: 'Elena Rostova',
        role: 'Security Researcher',
        time: '12 hours ago',
        content:
          'Appreciate that the CA certificate is generated locally per installation and not hardcoded. Great security posture.',
        upvotes: 8,
      },
    ],
  },
  {
    id: 'post-2',
    title: 'Why Zero Telemetry and 100% Client-Side WebCrypto Outperform SaaS Developer Tools',
    slug: 'zero-telemetry-client-side-webcrypto',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Author',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'dispatches',
    tags: ['Security', 'TokenLens', 'WebCrypto', 'Privacy', 'Compliance'],
    publishedAt: '3 days ago',
    readTime: '5 min read',
    upvotes: 62,
    commentsCount: 14,
    isPinned: true,
    summary:
      'How we use the W3C WebCrypto API in TokenLens and CipherLab to verify RS256, ES256, and HMAC signatures directly in browser memory without sending a single byte to an external server.',
    content: [
      'In recent years, standard developer utilities (JWT decoders, JSON diff viewers, hash calculators) have morphed into bloated cloud services requiring logins and silently harvesting developer input for training or analytics.',
      'For engineers working in fintech, defense, healthcare, or strictly regulated enterprises, pasting a JWT containing internal user IDs or private RSA keys into a web tool is a severe compliance violation.',
      'In the Grassroot Digital suite, we adopted a strict architectural mandate: 100% of compute must execute in the browser using the W3C WebCrypto API (window.crypto.subtle) or in native standalone binaries. When you decode or verify a JWT in TokenLens, your keys never touch a network socket.',
    ],
    comments: [
      {
        id: 'c-3',
        author: 'Devin Thorne',
        role: 'Fintech Tech Lead',
        time: '2 days ago',
        content:
          'We banned jwt.io at our company due to data leakage concerns. TokenLens is now our team’s official internal standard for JWT inspection.',
        upvotes: 19,
      },
    ],
  },
  {
    id: 'post-3',
    title: 'RFC 001: WebSocket & Server-Sent Events (SSE) Live Frame Interception in Endly',
    slug: 'rfc-websocket-sse-frame-interception',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Author',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'rfcs',
    tags: ['RFC', 'Endly', 'WebSockets', 'SSE', 'Feature Proposal'],
    publishedAt: '2 days ago',
    readTime: '4 min read',
    upvotes: 35,
    commentsCount: 11,
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
    comments: [
      {
        id: 'c-4',
        author: 'Alex Kumar',
        role: 'Full Stack Engineer',
        time: '1 day ago',
        content:
          'A filter for heartbeat/ping-pong frames would be huge! It gets super noisy when debugging real chat apps.',
        upvotes: 14,
      },
      {
        id: 'c-5',
        author: 'Sarah Jenkins',
        role: 'AI Platform Eng',
        time: '14 hours ago',
        content:
          'For SSE, please support parsing markdown/JSON streams in real time as OpenAI and Claude chunks come in.',
        upvotes: 11,
      },
    ],
  },
  {
    id: 'post-4',
    title: 'TokenLens Deep Dive: Verifying RS256 & ES256 Signatures Offline with JWKS URL Caching',
    slug: 'tokenlens-offline-rs256-jwks',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Author',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'tokenlens',
    tags: ['TokenLens', 'JWT', 'JWKS', 'Cryptography', 'RS256'],
    publishedAt: '4 days ago',
    readTime: '4 min read',
    upvotes: 29,
    commentsCount: 6,
    isPinned: false,
    summary:
      'How TokenLens parses OpenID Connect and Auth0/Okta .well-known/jwks.json public keys to verify asymmetric signatures completely on client devices.',
    content: [
      'When testing OAuth2 and OpenID Connect tokens from providers like Auth0, AWS Cognito, or Keycloak, verifying signature validity usually requires converting JWKS keys into PEM format or sending tokens to an endpoint.',
      'TokenLens allows you to paste the raw JWKS JSON or JWKS URI, extracts the matching `kid` (Key ID), and converts the RSA/ECDSA modulus/exponent into native CryptoKey structures using WebCrypto.',
    ],
    comments: [],
  },
  {
    id: 'post-5',
    title: 'Semantic JSON Tree Diffing: High-Performance Diffing Without Freezing the Main Thread',
    slug: 'semantic-json-diffing-algorithms',
    author: {
      name: 'Rajesh Narwal',
      role: 'Founder & Mobile Architect',
      badge: 'Author',
      avatarUrl: '/images/rajesh-narwal.jpg',
    },
    category: 'jsonlens',
    tags: ['JSONLens', 'Algorithms', 'Web Workers', 'Performance'],
    publishedAt: '5 days ago',
    readTime: '5 min read',
    upvotes: 31,
    commentsCount: 4,
    isPinned: false,
    summary:
      'Why line-by-line text diffing fails for JSON, and how JSONLens implements recursive AST comparison and Web Workers to diff 50MB+ payloads smoothly.',
    content: [
      'Line-by-line diff tools (like standard git diff or text comparison engines) break down with JSON because key ordering is semantically irrelevant, yet causes 100% false positive diffs.',
      'In JSONLens, we normalize and parse payloads into structured property trees, sort dictionaries alphabetically, and run the diff calculation inside a dedicated Web Worker to maintain a smooth 60fps UI.',
    ],
    comments: [],
  },
];

interface OpenGroundProps {
  onBackToHome: () => void;
  onSelectProduct?: (productId: string) => void;
}

export const OpenGround: React.FC<OpenGroundProps> = ({ onBackToHome, onSelectProduct }) => {
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    const saved = localStorage.getItem('grassroot_openground_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_POSTS;
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

  // New Post Form State
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<ForumPost['category']>('discussions');
  const [newPostTags, setNewPostTags] = useState('');
  const [newPostSummary, setNewPostSummary] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('');

  // Persist posts
  useEffect(() => {
    localStorage.setItem('grassroot_openground_posts', JSON.stringify(posts));
  }, [posts]);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
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
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => (prev ? { ...prev, upvotes: prev.upvotes + 1 } : null));
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newCommentText.trim()) return;

    const newComment: ForumComment = {
      id: `c-${Date.now()}`,
      author: commenterName.trim() || 'Anonymous Engineer',
      role: 'Community Member',
      time: 'Just now',
      content: newCommentText.trim(),
      upvotes: 1,
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
      upvotes: 1,
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

  const categories = [
    { id: 'all', label: 'All Discussions & Articles', icon: Layers },
    { id: 'dispatches', label: 'Engineering Dispatches', icon: FileText },
    { id: 'rfcs', label: 'Feature RFCs & Roadmap', icon: Sparkles },
    { id: 'endly', label: 'Endly Hub', icon: Zap },
    { id: 'tokenlens', label: 'TokenLens Hub', icon: Shield },
    { id: 'jsonlens', label: 'JSONLens Hub', icon: Tag },
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
            <span>Open Ground • Engineering Publication & Forum</span>
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight text-text-primary">
            Open Ground{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              Dispatches
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            The community discussion hub and technical publication of Grassroot Digital. Explore architectural deep-dives, RFC feature proposals, and privacy-first engineering debates.
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
              placeholder="Search articles, RFCs, Endly mobile proxy tips, WebCrypto discussions..."
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
          <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
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
                <h3 className="font-heading font-bold text-lg text-text-primary">No discussions found</h3>
                <p className="text-xs text-text-secondary">
                  No articles or discussion threads matched your search query. Try clearing filters or be the first to start a topic!
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
                  {/* Pinned Tag Badge */}
                  {post.isPinned && (
                    <div className="flex items-center space-x-1 text-[11px] font-mono font-bold text-amber-400 mb-2.5">
                      <Pin className="w-3.5 h-3.5 fill-amber-400" />
                      <span>PINNED ARCHITECTURAL DISPATCH</span>
                    </div>
                  )}

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
                        className="flex items-center space-x-1.5 hover:text-orange-400 transition-colors p-1 cursor-pointer"
                        title="Upvote Discussion"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
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

          {/* Right Sidebar: About Open Ground & Guidelines */}
          <div className="lg:col-span-4 space-y-6">
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
                Open Ground is where our engineering team posts architectural lessons, RFC specifications, and where developers share real-world debugging workflows, mobile interceptor recipes, and privacy strategies.
              </p>

              <div className="space-y-2 pt-2 text-xs text-text-secondary">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero spam, high-signal technical discussions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Direct input on tool roadmaps and RFCs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>No account walls or tracking scripts</span>
                </div>
              </div>

              <button
                onClick={() => setIsNewPostModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-background-elevated hover:bg-background-tertiary border border-border hover:border-accent text-xs font-bold text-text-primary transition-all text-center block cursor-pointer"
              >
                Submit Discussion Topic
              </button>
            </div>

            {/* Quick Product Reference Card */}
            <div className="p-5 rounded-2xl bg-background-secondary/60 border border-border space-y-3 text-xs">
              <div className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                Product Channels
              </div>
              <div className="space-y-2">
                <a
                  href="https://endly.grassroot.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-background-tertiary/70 hover:bg-background-elevated text-text-primary transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold">Endly API Client</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-text-muted" />
                </a>

                <a
                  href="https://tokenlens.grassroot.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-background-tertiary/70 hover:bg-background-elevated text-text-primary transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-semibold">TokenLens JWT Studio</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-text-muted" />
                </a>

                <a
                  href="https://jsonlens.grassroot.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-background-tertiary/70 hover:bg-background-elevated text-text-primary transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold">JSONLens Formatter</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-text-muted" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Detail Modal / Reader View */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl max-h-[90vh] bg-background-secondary border border-border rounded-3xl shadow-2xl overflow-y-auto flex flex-col text-text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary/95 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold text-accent uppercase">
                  {selectedPost.category.toUpperCase()}
                </span>
                <span className="text-text-muted">•</span>
                <span className="text-xs text-text-muted">{selectedPost.publishedAt}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpvotePost(selectedPost.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-background-elevated hover:bg-accent hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
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
            <div className="p-6 sm:p-8 space-y-6">
              {/* Author & Header */}
              <div>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary leading-tight mb-4">
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

              {/* Article Paragraphs */}
              <div className="space-y-4 text-text-secondary text-sm sm:text-base leading-relaxed border-t border-b border-border/70 py-6">
                {selectedPost.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Discussion / Comments Section */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-lg text-text-primary flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-accent" />
                    <span>Discussion & Replies ({selectedPost.comments.length})</span>
                  </h4>
                </div>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-3 p-4 rounded-2xl bg-background-primary/80 border border-border">
                  <div className="text-xs font-bold text-text-primary">Join the Discussion:</div>
                  <input
                    type="text"
                    value={commenterName}
                    onChange={(e) => setCommenterName(e.target.value)}
                    placeholder="Your Name / Title (e.g. Alex • Mobile Dev)"
                    className="w-full px-3.5 py-2 rounded-xl bg-background-secondary border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                  <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Share your thoughts, architectural feedback, or ask questions..."
                    className="w-full px-3.5 py-2 rounded-xl bg-background-secondary border border-border text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer"
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
                className="p-2 rounded-xl hover:bg-background-tertiary text-text-muted hover:text-text-primary"
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
