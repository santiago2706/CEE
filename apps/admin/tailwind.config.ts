import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cee: {
          red: '#8B1A1A',
          'red-dark': '#6B1212',
          cream: '#F5F0E8',
        },
      },
    },
  },
  plugins: [animate],
} satisfies Config;

export default config;
