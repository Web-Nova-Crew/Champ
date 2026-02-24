import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        // Estato Brand Colors - Exact Match with Flutter App Logo
        // Gradient: Magenta (#E91E63) → Purple (#7B2D8E) → Deep Blue (#1A237E)
        // Accent: Cyan (#00BCD4)
        primary: {
          50: '#F3E5F5',
          100: '#E1BEE7',
          200: '#CE93D8',
          300: '#BA68C8',
          400: '#9B4DB0',
          500: '#7B2D8E',  // Main Primary - Purple from logo center
          600: '#7B2D8E',  // Primary Purple
          700: '#5E1F6D',  // Darker Purple
          800: '#4A1259',
          900: '#380D45',
        },
        secondary: {
          50: '#FCE4EC',
          100: '#F8BBD0',
          200: '#F48FB1',
          300: '#F06292',
          400: '#EC407A',
          500: '#E91E63',  // Magenta/Pink from logo top
          600: '#D81B60',
          700: '#C2185B',
          800: '#AD1457',
          900: '#880E4F',
        },
        accent: {
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DD0E1',
          400: '#26C6DA',
          500: '#00BCD4',  // Cyan from logo handshake
          600: '#00ACC1',
          700: '#0097A7',
          800: '#00838F',
          900: '#006064',
        },
        deepblue: {
          400: '#283593',
          500: '#1A237E',  // Deep blue from logo bottom
          600: '#0D1B5E',
          700: '#0A1445',
        },
      },
      backgroundImage: {
        'gradient-estato': 'linear-gradient(135deg, #E91E63 0%, #7B2D8E 50%, #1A237E 100%)',
        'gradient-primary': 'linear-gradient(135deg, #7B2D8E 0%, #5E1F6D 100%)',
        'gradient-hero': 'linear-gradient(135deg, #E91E63 0%, #7B2D8E 35%, #1A237E 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(123,45,142,0.1) 0%, rgba(26,35,126,0.1) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
