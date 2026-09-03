import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCarousel } from './components/ProductCarousel';
import { ProductGrid } from './components/ProductGrid';
import { PrivacyManifesto } from './components/PrivacyManifesto';
import { AboutMe } from './components/AboutMe';
import { DeveloperFAQ } from './components/DeveloperFAQ';
import { Footer } from './components/Footer';
import { EarlyAccessModal } from './components/EarlyAccessModal';
import { DownloadDesktopModal, AppDownloadConfig } from './components/DownloadDesktopModal';
import { ProductItem } from './types';
import { PRODUCTS } from './data/products';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'midnight' | 'light'>('dark');
  const [selectedProductId, setSelectedProductId] = useState<string>('endly');
  const [earlyAccessProduct, setEarlyAccessProduct] = useState<ProductItem | null>(null);
  const [downloadProduct, setDownloadProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('grassroot_theme') as 'dark' | 'midnight' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.remove('dark', 'midnight', 'light');
    document.documentElement.classList.add(savedTheme);
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'midnight' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('grassroot_theme', newTheme);
    document.documentElement.classList.remove('dark', 'midnight', 'light');
    document.documentElement.classList.add(newTheme);
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const el = document.getElementById('showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    const el = document.getElementById('showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenDownload = (productOrId: ProductItem | string) => {
    if (typeof productOrId === 'string') {
      const prod = PRODUCTS.find((p) => p.id === productOrId) || {
        id: 'endly',
        name: 'Endly',
        tagline: 'Cross-Platform API Client & Proxy',
        downloads: {
          macArmUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.0/Endly-1.0.0-arm64.dmg',
          macIntelUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.0/Endly-1.0.0.dmg',
          winUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.0/Endly-Setup-1.0.0.exe',
          linuxUrl: 'https://github.com/rjnarwal/endly/releases/download/v1.0.0/Endly-1.0.0.AppImage',
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
    version: 'v1.0.0',
    downloads: {
      macArm: product.downloads?.macArmUrl || `https://github.com/rjnarwal/${product.id}/releases/download/v1.0.0/${product.name}-1.0.0-arm64.dmg`,
      macIntel: product.downloads?.macIntelUrl || `https://github.com/rjnarwal/${product.id}/releases/download/v1.0.0/${product.name}-1.0.0.dmg`,
      winX64: product.downloads?.winUrl || `https://github.com/rjnarwal/${product.id}/releases/download/v1.0.0/${product.name}-Setup-1.0.0.exe`,
      linuxAppImage: product.downloads?.linuxUrl || `https://github.com/rjnarwal/${product.id}/releases/download/v1.0.0/${product.name}-1.0.0.AppImage`,
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background-primary text-text-primary selection:bg-accent selection:text-white antialiased">
      {/* Top Fixed Navbar */}
      <Navbar
        theme={theme}
        onThemeChange={handleThemeChange}
        onSelectProduct={handleSelectProduct}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
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
      </main>

      {/* Footer */}
      <Footer onSelectProduct={handleSelectProduct} />

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
