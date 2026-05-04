/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-from': '#FF3E80',
        'brand-to':   '#7C3AED',
        'brand-mid':  '#A855F7',
        'bg-base':     '#0A0A10',
        'bg-surface':  '#111118',
        'bg-elevated': '#18181F',
        'bg-overlay':  '#1E1E28',
        'text-primary':   '#FAFAFA',
        'text-secondary': '#A1A1B5',
        'text-tertiary':  '#6B6B80',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        xs:    ['12px', '18px'],
        sm:    ['13px', '20px'],
        base:  ['15px', '24px'],
        lg:    ['17px', '28px'],
        xl:    ['20px', '30px'],
        '2xl': ['24px', '34px'],
        '3xl': ['30px', '38px'],
        '4xl': ['36px', '44px'],
        '5xl': ['48px', '54px'],
        '6xl': ['60px', '66px'],
        '7xl': ['72px', '78px'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight:   '-0.02em',
        normal:  '-0.011em',
      },
      boxShadow: {
        brand:   '0 4px 16px rgba(168, 85, 247, 0.35)',
        'brand-lg': '0 0 60px rgba(168, 85, 247, 0.25), 0 0 120px rgba(255, 62, 128, 0.1)',
        card:    '0 1px 0 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
        xl:      '0 8px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06)',
      },
      borderRadius: {
        sm:  '6px',
        md:  '10px',
        lg:  '14px',
        xl:  '18px',
        '2xl': '24px',
        '3xl': '32px',
      },
      animation: {
        'fade-up':  'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':  'fade-in 0.4s ease both',
        shake:      'shake 0.45s ease',
        float:      'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-5px)' },
          '40%,80%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)' },
          '50%':      { boxShadow: '0 0 40px rgba(168, 85, 247, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};
