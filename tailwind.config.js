module.exports = {
  /** @type {import('tailwindcss').Config} */
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ink: {
          DEFAULT: '#0B0E14',
          light: '#152449',
          muted: 'rgba(11,14,20,0.60)',
        },
        sky: {
          day: '#70A3E6',
          dawn: '#EFA96E',
          dusk: '#252A66',
          night: '#0A1024',
        },
        primary: {
          light: '#4da6ff',
          DEFAULT: '#0078ff',
          dark: '#0057b8',
        },
        secondary: {
          light: '#f8f9fa',
          DEFAULT: '#e9ecef',
          dark: '#dee2e6',
        },
      },
      borderRadius: {
        pill: '999px',
      },
      letterSpacing: {
        tighter: '-0.035em',
        tight: '-0.02em',
      },
    },
  },
  plugins: [],
};
