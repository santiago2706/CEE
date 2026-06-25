import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontSize: {
        // Escala base ~10-15% más grande que el default de Tailwind, fluida con clamp().
        xs: ['clamp(0.78rem, 0.74rem + 0.2vw, 0.85rem)', { lineHeight: '1.5' }],
        sm: ['clamp(0.9rem, 0.86rem + 0.2vw, 0.97rem)', { lineHeight: '1.6' }],
        base: ['clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)', { lineHeight: '1.65' }],
        lg: ['clamp(1.2rem, 1.12rem + 0.4vw, 1.3rem)', { lineHeight: '1.6' }],
        xl: ['clamp(1.35rem, 1.25rem + 0.5vw, 1.5rem)', { lineHeight: '1.55' }],
        '2xl': ['clamp(1.6rem, 1.45rem + 0.75vw, 1.85rem)', { lineHeight: '1.4' }],
        '3xl': ['clamp(1.95rem, 1.7rem + 1.25vw, 2.35rem)', { lineHeight: '1.3' }],
        '4xl': ['clamp(2.3rem, 1.95rem + 1.75vw, 2.85rem)', { lineHeight: '1.2' }],
        '5xl': ['clamp(2.75rem, 2.2rem + 2.75vw, 3.6rem)', { lineHeight: '1.1' }],
        '6xl': ['clamp(3.3rem, 2.5rem + 4vw, 4.5rem)', { lineHeight: '1.05' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        cee: {
          // Paleta oficial del manual de marca (4 colores: guinda, plomo, negro, blanco).
          // `red` es el alias del tono 700 (uso por defecto); la rampa completa permite
          // degradados y estados (hover/active) sin salir de la marca.
          red: {
            50: '#FBF1F1',
            100: '#F3DCDC',
            200: '#E4B6B6',
            300: '#D08F8F',
            400: '#B36464',
            500: '#8C3A3A',
            600: '#753030',
            700: '#682222',
            800: '#4F1A1A',
            900: '#3A1313',
            DEFAULT: '#682222',
          },
          'red-dark': '#4F1A1A',
          'red-light': '#8C3A3A',
          plomo: '#A9A9A9',
          gray: '#A9A9A9',
          ink: '#000000',
        },
        surface: {
          // Fondos de sección alternos al blanco (Iniciativas C/E del plan de mejoras),
          // derivados del manual de marca, no colores nuevos.
          cream: '#FAF6EE',
          grey: '#F3F1EF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
} satisfies Config;

export default config;
