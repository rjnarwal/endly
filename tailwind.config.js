/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./landing/index.html",
    "./landing/src/**/*.{js,ts,jsx,tsx}",
    "./tokenlens/index.html",
    "./tokenlens/src/**/*.{js,ts,jsx,tsx}",
    "./jsonlens/index.html",
    "./jsonlens/src/**/*.{js,ts,jsx,tsx}",
    "./regexforge/index.html",
    "./regexforge/src/**/*.{js,ts,jsx,tsx}",
    "./cipherlab/index.html",
    "./cipherlab/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--color-bg-primary)',
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
        },
        border: {
          DEFAULT: 'var(--color-border-primary)',
          primary: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
          muted: 'var(--color-border-secondary)',
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
        method: {
          get: '#10b981',
          post: '#f59e0b',
          put: '#3b82f6',
          patch: '#8b5cf6',
          delete: '#ef4444',
          head: '#06b6d4',
          options: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
