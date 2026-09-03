export type ProductStatus = 'live' | 'beta' | 'coming-soon';

export type ProductCategory = 'all' | 'api' | 'security' | 'formatters' | 'utilities';

export interface ProductFeature {
  title: string;
  description: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  status: ProductStatus;
  badgeText: string;
  iconName: string;
  accentColor: string;
  gradient: string;
  url?: string;
  features: ProductFeature[];
  previewMockup: {
    type: 'api-client' | 'jwt-decoder' | 'json-diff' | 'regex-tester' | 'crypto-studio';
    sampleCode?: string;
    sampleResult?: string;
    tags: string[];
  };
  githubUrl?: string;
  downloads?: {
    macArmUrl?: string;
    macIntelUrl?: string;
    winUrl?: string;
    linuxUrl?: string;
    releasesUrl?: string;
  };
  actions: {
    primaryLabel: string;
    primaryUrl?: string;
    isExternal: boolean;
    secondaryLabel?: string;
    secondaryUrl?: string;
  };
}
