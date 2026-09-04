import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCarousel } from './components/ProductCarousel';
import { ProductGrid } from './components/ProductGrid';
import { PrivacyManifesto } from './components/PrivacyManifesto';
import { AboutMe } from './components/AboutMe';
import { DeveloperFAQ } from './components/DeveloperFAQ';
import { Footer } from './components/Footer';
import { OpenGround } from './components/OpenGround';
import { EarlyAccessModal } from './components/EarlyAccessModal';
import { DownloadDesktopModal, AppDownloadConfig } from './components/DownloadDesktopModal';
import { ProductItem } from './types';
import { PRODUCTS } from './data/products';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'midnight' | 'light'>('dark');
  const [activeView, setActiveView] = useState<'home' | 'openground'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('endly');
  const [earlyAccessProduct, setEarlyAccessProduct] = useState<ProductItem | null>(null);
  const [downloadProduct, setDownloadProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('grassroot_theme') as 'dark' | 'midnight' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.remove('dark', 'midnight', 'light');
    document.documentElement.classList.add(savedTheme);

    // Check URL hash on initial load
    const hash = window.location.hash.toLowerCase();
    if (hash === '#openground' || hash === '#open-ground' || hash === '#forum') {
      setActiveView('openground');
    }

    const handleHashChange = () => {
      const currentHash = window.location.hash.toLowerCase();
      if (currentHash === '#openground' || currentHash === '#open-ground' || currentHash === '#forum') {
        setActiveView('openground');
      } else if (currentHash === '' || currentHash === '#home' || currentHash.startsWith('#')) {
        if (currentHash !== '#openground' && currentHash !== '#open-ground' && currentHash !== '#forum') {
          // If navigating to an anchor on home
          if (activeView === 'openground') {
            setActiveView('home');
          }
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeView]);

  const handleNavigateView = (view: 'home' | 'openground') => {
    setActiveView(view);
    if (view === 'openground') {
      window.location.hash = 'open-ground';
    } else {
      if (window.location.hash.includes('open-ground') || window.location.hash.includes('openground')) {
        history.pushState('', document.title, window.location.pathname + window.location.search);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleThemeChange = (newTheme: 'dark' | 'midnight' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('grassroot_theme', newTheme);
    document.documentElement.classList.remove('dark', 'midnight', 'light');
    document.documentElement.classList.add(newTheme);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    if (activeView !== 'home') {
      handleNavigateView('home');
    }
    setTimeout(() => {
      const el = document.getElementById('showcase');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleExploreClick = () => {
    if (activeView !== 'home') {
      handleNavigateView('home');
    }
    setTimeout(() => {
      const el = document.getElementById('showcase');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleOpenDownload = (productOrId: ProductItem | string) => {
    if (typeof productOrId === 'string') {
      const prod = PRODUCTS.find((p) => p.id === productOrId) || {
        id: 'endly',
        name: 'Endly',
        tagline: 'Cross-Platform API Client & Proxy',
        downloads: {
          macArmUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.1/Endly-1.0.1-arm64.dmg',
          macIntelUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.1/Endly-1.0.1.dmg',
          winUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.1/Endly.Setup.1.0.1.exe',
          linuxUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.1/Endly-1.0.1.AppImage',
        },
      } as any;
      setDownloadProduct(prod);
    } else {
      setDownloadProduct(productOrId);
    }
  };

  const getDownloadConfig = (product: ProductItem): AppDownloadConfig => ({
    appName: product.name,
    tagline: product.tagline,
    version: 'v1.0.1',
    downloads: {
      macArm: product.downloads?.macArmUrl || `https://github.com/rjnarwal/${product.id}/releases/download/v1.0.1/${product.name}-1.0.1-arm64.dmg`,
      macIntel: product.downloads?.macIntelUrl || `https://github.com/rjnarwal/${product.id}/releases/download/v1.0.1/${product.name}-1.0.1.dmg`,
      winX64: product.downloads?.winUrl || `https://github.com/rjnarwal/${product.id}/releases/download/v1.0.1/${product.name}.Setup.1.0.1.exe`,
      linuxAppImage: product.downloads?.linuxUrl || `https://github.com/rjnarwal/${product.id}/releases/download/v1.0.1/${product.name}-1.0.1.AppImage`,
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background-primary text-text-primary selection:bg-accent selection:text-white antialiased">
      {/* Top Fixed Navbar */}
      <Navbar
        theme={theme}
        onThemeChange={handleThemeChange}
        onSelectProduct={handleSelectProduct}
        activeView={activeView}
        onNavigateView={handleNavigateView}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeView === 'openground' ? (
          <OpenGround
            onBackToHome={() => handleNavigateView('home')}
            onSelectProduct={handleSelectProduct}
          />
        ) : (
          <>
            {/* Hero Section */}
            <Hero
              onExploreClick={handleExploreClick}
              onOpenDownload={handleOpenDownload}
            />

            {/* Interactive Carousel Showcase */}
            <ProductCarousel
              selectedProductId={selectedProductId}
              onOpenEarlyAccess={(prod) => setEarlyAccessProduct(prod)}
              onOpenDownload={handleOpenDownload}
            />

            {/* Full Product Grid Directory */}
            <ProductGrid
              onSelectProduct={handleSelectProduct}
              onOpenEarlyAccess={(prod) => setEarlyAccessProduct(prod)}
              onOpenDownload={handleOpenDownload}
            />

            {/* About The Builder Section */}
            <AboutMe />

            {/* Privacy & Performance Manifesto + Desktop Downloads */}
            <PrivacyManifesto onOpenDownload={handleOpenDownload} />

            {/* Developer FAQ & Knowledge Base for Search Ranking */}
            <DeveloperFAQ />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectProduct={handleSelectProduct}
        onNavigateView={handleNavigateView}
      />

      {/* Early Access / Preview Modal */}
      <EarlyAccessModal
        product={earlyAccessProduct}
        onClose={() => setEarlyAccessProduct(null)}
      />

      {/* Direct OS Binary Download Modal */}
      {downloadProduct && (
        <DownloadDesktopModal
          isOpen={Boolean(downloadProduct)}
          onClose={() => setDownloadProduct(null)}
          config={getDownloadConfig(downloadProduct)}
        />
      )}
    </div>
  );
};

export default App;

