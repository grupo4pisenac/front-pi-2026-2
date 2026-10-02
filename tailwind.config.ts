import type { Config } from 'tailwindcss';
import { palette, fontFamily } from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: palette,
      fontFamily: { sans: fontFamily },
      fontSize: {
        eyebrow: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.12em', fontWeight: '600' }],
        label: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.1em', fontWeight: '600' }],
        h1: ['2.125rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em', fontWeight: '500' }],
        kpi: ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        card: '16px',
        tile: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(31, 42, 34, 0.03), 0 1px 1px rgba(31, 42, 34, 0.02)',
        pop: '0 12px 32px -8px rgba(31, 42, 34, 0.16), 0 2px 6px rgba(31, 42, 34, 0.06)',
      },
      spacing: {
        sidebar: '20rem',
        gutter: '2.75rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'page-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.98) translateY(4px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'ping-soft': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '80%, 100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s linear infinite',
        'page-in': 'page-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 150ms ease-out',
        'pop-in': 'pop-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slide-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'ping-soft': 'ping-soft 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
