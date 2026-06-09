/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--c-bg)',
        surface: 'var(--c-surface)',
        soft: 'var(--c-soft)',
        ink: 'var(--c-ink)',
        'ink-muted': 'var(--c-ink-muted)',
        primary: 'var(--c-primary)',
        secondary: 'var(--c-secondary)',
        accent: 'var(--c-accent)',
        'accent-ink': 'var(--c-accent-ink)',
        border: 'var(--c-border)',
      },
      fontFamily: {
        sans: 'var(--font-body)',
        display: 'var(--font-display)',
      },
      maxWidth: { container: '1200px' },
      borderRadius: { '2xl': '1rem' },
    },
  },
  plugins: [],
};
