/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#C9A84C', light: '#F0D080', dark: '#8B6914' },
        ink:  { DEFAULT: '#0a0a0a', 50: '#1a1a1a', 100: '#111' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"EB Garamond"',        'Georgia', 'serif'],
        accent:  ['"Cinzel"',             'serif'],
      },
      animation: {
        shimmer:    'shimmer 4s linear infinite',
        float:      'float 6s ease-in-out infinite',
        fadeUp:     'fadeUp 0.8s ease forwards',
        glowPulse:  'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer:   { '0%':{ backgroundPosition:'0% center' }, '100%':{ backgroundPosition:'200% center' } },
        float:     { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-12px)' } },
        fadeUp:    { from:{ opacity:'0', transform:'translateY(30px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        glowPulse: { '0%,100%':{ boxShadow:'0 0 20px rgba(201,168,76,0.3)' }, '50%':{ boxShadow:'0 0 50px rgba(201,168,76,0.6)' } },
      },
    },
  },
  plugins: [],
}
