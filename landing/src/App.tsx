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
import { ProductItem } from './types';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'midnight' | 'light'>('dark');
  const [selectedProductId, setSelectedProductId] = useState<string>('endly');
  const [earlyAccessProduct, setEarlyAccessProduct] = useState<ProductItem | null>(null);

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
        <Hero onExploreClick={handleExploreClick} />

        {/* Interactive Carousel Showcase */}
        <ProductCarousel
          selectedProductId={selectedProductId}
          onOpenEarlyAccess={(prod) => setEarlyAccessProduct(prod)}
        />

        {/* Full Product Grid Directory */}
        <ProductGrid
          onSelectProduct={handleSelectProduct}
          onOpenEarlyAccess={(prod) => setEarlyAccessProduct(prod)}
        />

        {/* About The Builder Section */}
        <AboutMe />

        {/* Privacy & Performance Manifesto + Desktop Downloads */}
        <PrivacyManifesto />

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
    </div>
  );
};

export default App;
