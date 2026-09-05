/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'body-bg': 'var(--color-bg-primary)',
        'card-bg': 'var(--color-bg-secondary)',
        'card-border': 'var(--color-border-primary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        brand: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          muted: 'var(--color-accent-muted)',
        },
        background: {
          DEFAULT: 'var(--color-bg-primary)',
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
        },
        border: {
          DEFAULT: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
        },
        text: {
          DEFAULT: 'var(--color-text-primary)',
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          muted: 'var(--color-accent-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
