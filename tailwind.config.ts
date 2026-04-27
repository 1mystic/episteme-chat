import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: '#FFB000',
          soft: 'rgba(255,176,0,0.12)',
          glow: 'rgba(255,176,0,0.25)',
        },
        bg: {
          DEFAULT: '#08090A',
          surface: '#191209',
          elevated: '#251e15',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.20)',
        },
        text: {
          primary: '#eee0d0',
          muted: '#d7c4ac',
          dim: '#9f8e78',
        },
      },
      fontFamily: {
        grotesk: ['var(--font-space-grotesk)', 'sans-serif'],
        jetbrains: ['var(--font-jetbrains)', 'monospace'],
        playfair: ['var(--font-playfair)', 'serif'],
        goldman: ['var(--font-goldman)', 'sans-serif'],
      },
      spacing: {
        '4.5': '1.125rem',
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

export default config
