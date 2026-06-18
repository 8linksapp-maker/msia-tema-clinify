import typography from '@tailwindcss/typography';

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
        'accent-strong': 'var(--c-accent-strong)',
        border: 'var(--c-border)',

        // --- Admin (CMS do scaffold) — paleta Café-da-Tarde, namespaced adm-* ---
        // Valores literais vindos do scaffold (src/styles/admin.css + global.css).
        'adm-bg': 'rgb(250 248 244)',
        'adm-surface': 'rgb(255 254 251)',
        'adm-elev': 'rgb(244 240 232)',
        'adm-border': 'rgb(224 218 206)',
        'adm-rule': 'rgb(212 204 188)',
        'adm-ink': 'rgb(20 20 24)',
        'adm-ink-muted': 'rgb(76 74 82)',
        'adm-ink-faint': 'rgb(136 130 130)',
        'adm-primary': 'rgb(139 74 54)',
        'adm-primary-soft': 'rgb(237 216 207)',
        'adm-cat-terracota': 'rgb(197 92 62)',
        'adm-cat-azul-tinta': 'rgb(52 88 162)',
        'adm-cat-oliva': 'rgb(95 116 54)',
        'adm-cat-ocre': 'rgb(196 152 56)',
        'adm-cat-vinho': 'rgb(140 52 76)',
      },
      fontFamily: {
        sans: 'var(--font-body)',
        display: 'var(--font-display)',
      },
      maxWidth: { container: '1200px' },
      borderRadius: { '2xl': '1rem' },
    },
  },
  plugins: [typography],
};
