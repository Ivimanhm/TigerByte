/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        cyan: 'var(--cyan)',
        violet: 'var(--violet)',
        electric: 'var(--electric)',
        rust: 'var(--rust)',
      },
      boxShadow: {
        glow: '0 0 24px rgba(56, 189, 248, 0.28)',
        violet: '0 0 26px rgba(139, 92, 246, 0.28)',
      },
      borderRadius: {
        panel: '1.1rem',
      },
    },
  },
  plugins: [],
}
