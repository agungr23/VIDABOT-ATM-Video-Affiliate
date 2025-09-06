/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TikTok Color Palette
        tiktok: {
          black: '#000000',
          dark: '#161823',
          white: '#FFFFFF',
          pink: '#FE2C55',
          'pink-light': '#FF0050',
          cyan: '#25F4EE',
          'cyan-light': '#00F2EA',
          gray: '#8A8B9B',
          'gray-light': '#C7C8CC',
        },
        // Shopee Color Palette
        shopee: {
          orange: '#EE4D2D',
          'orange-light': '#FF6600',
          'orange-dark': '#D73502',
          red: '#D0011B',
          white: '#FFFFFF',
          gray: '#F5F5F5',
          'gray-light': '#EEEEEE',
          'gray-dark': '#757575',
          black: '#212121',
        },
        // Combined Modern Palette
        modern: {
          primary: '#FE2C55',
          secondary: '#EE4D2D',
          accent: '#25F4EE',
          dark: '#161823',
          light: '#FFFFFF',
          'gray-50': '#F9FAFB',
          'gray-100': '#F3F4F6',
          'gray-200': '#E5E7EB',
          'gray-300': '#D1D5DB',
          'gray-400': '#9CA3AF',
          'gray-500': '#6B7280',
          'gray-600': '#4B5563',
          'gray-700': '#374151',
          'gray-800': '#1F2937',
          'gray-900': '#111827',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
