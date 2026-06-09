# Clinify — Estágio 1: Tema Standalone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o site de clínica standalone (Astro + Tailwind), visual inspirado no Dentaire, com a camada tokens+blocos funcionando — site no ar, troca de tema por 1 string, 11 blocos renderizando de `page.json`.

**Architecture:** Astro estático puro. Tema = CSS vars injetadas a partir de um preset JSON (`themes/dental.json`), consumidas por tokens semânticos do Tailwind. Home = `page.json` (lista de blocos) → `BlockRenderer` percorre um `registry` (type→componente). Cada bloco é Astro tipado, lê só de props, estiliza só com tokens. Sem CMS ainda (Estágio 2). Sem porte do HTML do Dentaire — código original inspirado na paleta/tipografia/seções.

**Tech Stack:** Astro 5.1, Tailwind 3, Bun, Vitest (2 testes de lógica), Poppins (Google Fonts).

**Spec:** `docs/superpowers/specs/2026-06-09-clinify-multi-especialidade-design.md`

---

## File Structure (Estágio 1)

```
clinify/
  package.json, astro.config.mjs, tailwind.config.mjs, tsconfig.json, vitest.config.ts
  src/
    data/
      siteConfig.json        ← nome da clínica, contato, social
      theme.json             ← { preset, overrides }
      themes/dental.json     ← tokens reais (Dentaire)
      themes/harmonizacao.json ← stub (prova a troca de tema)
      page.json              ← composição dos 11 blocos + conteúdo pt-BR
    lib/theme.ts             ← buildVars()/resolveTheme()/varsToCss()  [testado]
    blocks/
      types.ts               ← BLOCK_TYPES (strings)  [testado contra page.json]
      registry.ts            ← type → componente Astro
      BlockRenderer.astro
      Hero.astro Sobre.astro Servicos.astro Numeros.astro
      PorqueEscolher.astro ComoFunciona.astro Equipe.astro
      Depoimentos.astro AntesDepois.astro Novidades.astro CtaContato.astro
    components/layout/Header.astro, Footer.astro
    components/ThemeStyle.astro
    layouts/BaseLayout.astro
    pages/index.astro
    styles/global.css
    test/theme.test.ts, test/blocks.test.ts
  public/  (placeholders)
```

**Convenção de tokens (CSS vars):** `--c-bg`, `--c-surface`, `--c-soft`, `--c-ink`, `--c-ink-muted`, `--c-primary`, `--c-secondary`, `--c-accent`, `--c-accent-ink`, `--c-border`, `--font-display`, `--font-body`. Nenhum hex hardcoded em componente — só classes de token (`bg-soft`, `text-accent`, etc.).

---

### Task 1: Bootstrap do projeto

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `.gitignore`

- [ ] **Step 1: Init git + estrutura de pastas**

Run:
```bash
cd /c/Projects/clinify && git init && mkdir -p src/data/themes src/lib src/blocks src/components/layout src/layouts src/pages src/styles src/test public/images
```

- [ ] **Step 2: `package.json`**

```json
{
  "name": "clinify",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.1.0"
  },
  "devDependencies": {
    "@astrojs/tailwind": "^5.1.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [tailwind({ applyBaseStyles: false })],
});
```

- [ ] **Step 4: `tailwind.config.mjs`**

```js
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
```

- [ ] **Step 5: `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "resolveJsonModule": true,
    "allowJs": true
  }
}
```

- [ ] **Step 6: `.gitignore`**

```
node_modules/
dist/
.astro/
.agents/
.env
.DS_Store
```

- [ ] **Step 7: Instalar deps**

Run: `cd /c/Projects/clinify && bun install`
Expected: instala sem erro; cria `bun.lock`.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "chore: bootstrap clinify astro+tailwind"
```

---

### Task 2: Theme tokens + resolver (testado)

**Files:**
- Create: `src/data/themes/dental.json`, `src/data/themes/harmonizacao.json`, `src/data/theme.json`, `src/lib/theme.ts`, `vitest.config.ts`, `src/test/theme.test.ts`

- [ ] **Step 1: `src/data/themes/dental.json`** (tokens reais do Dentaire)

```json
{
  "name": "Dental",
  "colors": {
    "bg": "#FFFFFF",
    "surface": "#FFFFFF",
    "soft": "#EFF8FF",
    "ink": "#0E384C",
    "ink-muted": "#527282",
    "primary": "#0E384C",
    "secondary": "#1E84B5",
    "accent": "#FFA800",
    "accent-ink": "#0E384C",
    "border": "#E1ECF2"
  },
  "fonts": { "display": "'Poppins', sans-serif", "body": "'Poppins', sans-serif" }
}
```

- [ ] **Step 2: `src/data/themes/harmonizacao.json`** (stub p/ provar a troca)

```json
{
  "name": "Harmonização",
  "colors": {
    "bg": "#FFFFFF",
    "surface": "#FFFFFF",
    "soft": "#F7EEEA",
    "ink": "#3A2A2A",
    "ink-muted": "#6E5C58",
    "primary": "#7A5C57",
    "secondary": "#B98E86",
    "accent": "#C9A24B",
    "accent-ink": "#2A1F1D",
    "border": "#ECE0DB"
  },
  "fonts": { "display": "'Poppins', sans-serif", "body": "'Poppins', sans-serif" }
}
```

- [ ] **Step 3: `src/data/theme.json`**

```json
{ "preset": "dental", "overrides": {} }
```

- [ ] **Step 4: `src/lib/theme.ts`**

```ts
import dental from '../data/themes/dental.json';
import harmonizacao from '../data/themes/harmonizacao.json';
import themeConfig from '../data/theme.json';

export interface ThemePreset {
  name: string;
  colors: Record<string, string>;
  fonts: { display: string; body: string };
}

export interface ThemeOverrides {
  colors?: Record<string, string>;
  fonts?: Partial<{ display: string; body: string }>;
}

export const PRESETS: Record<string, ThemePreset> = { dental, harmonizacao };

/** Pure: merge preset + overrides into a flat CSS-var map. Testable. */
export function buildVars(preset: ThemePreset, overrides: ThemeOverrides = {}): Record<string, string> {
  const colors = { ...preset.colors, ...(overrides.colors ?? {}) };
  const fonts = { ...preset.fonts, ...(overrides.fonts ?? {}) };
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(colors)) vars[`--c-${k}`] = v;
  vars['--font-display'] = fonts.display;
  vars['--font-body'] = fonts.body;
  return vars;
}

/** Reads the live theme.json and resolves the active preset. */
export function resolveTheme(): { vars: Record<string, string>; preset: ThemePreset } {
  const preset = PRESETS[themeConfig.preset] ?? PRESETS.dental;
  const vars = buildVars(preset, (themeConfig.overrides ?? {}) as ThemeOverrides);
  return { vars, preset };
}

export function varsToCss(vars: Record<string, string>): string {
  return ':root{' + Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';') + '}';
}
```

- [ ] **Step 5: `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['src/test/**/*.test.ts'] } });
```

- [ ] **Step 6: Write the failing test — `src/test/theme.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { buildVars, varsToCss, type ThemePreset } from '../lib/theme';

const fake: ThemePreset = {
  name: 'Fake',
  colors: { bg: '#fff', primary: '#111' },
  fonts: { display: 'A', body: 'B' },
};

describe('buildVars', () => {
  it('maps colors to --c-* vars and fonts to --font-*', () => {
    const v = buildVars(fake);
    expect(v['--c-bg']).toBe('#fff');
    expect(v['--c-primary']).toBe('#111');
    expect(v['--font-display']).toBe('A');
    expect(v['--font-body']).toBe('B');
  });

  it('overrides win over preset', () => {
    const v = buildVars(fake, { colors: { primary: '#999' } });
    expect(v['--c-primary']).toBe('#999');
    expect(v['--c-bg']).toBe('#fff');
  });
});

describe('varsToCss', () => {
  it('wraps vars in :root{}', () => {
    expect(varsToCss({ '--c-bg': '#fff' })).toBe(':root{--c-bg:#fff}');
  });
});
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd /c/Projects/clinify && bun run test`
Expected: PASS (3 testes verdes).

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(theme): token presets + resolver (dental, harmonizacao stub)"
```

---

### Task 3: global.css + ThemeStyle + BaseLayout

**Files:**
- Create: `src/styles/global.css`, `src/components/ThemeStyle.astro`, `src/layouts/BaseLayout.astro`

- [ ] **Step 1: `src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body {
    font-family: var(--font-body);
    @apply bg-bg text-ink-muted antialiased;
  }
  h1, h2, h3, h4 {
    font-family: var(--font-display);
    @apply text-ink font-semibold tracking-tight;
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; }
  }
}

@layer components {
  .container-x { @apply max-w-container mx-auto px-5 md:px-8; }
  .section { @apply py-16 md:py-24; }
  .eyebrow { @apply inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3; }
  .btn { @apply inline-flex items-center justify-center gap-2 rounded-full font-medium px-6 py-3 min-h-[44px] transition; }
  .btn-accent { @apply btn bg-accent text-accent-ink hover:brightness-95; }
  .btn-primary { @apply btn bg-primary text-white hover:brightness-125; }
  .btn-ghost { @apply btn border border-border text-ink hover:border-primary; }
  .card { @apply bg-surface border border-border rounded-2xl; }
  .ic { @apply inline-grid place-items-center w-12 h-12 rounded-xl bg-soft text-secondary shrink-0; }
}
```

- [ ] **Step 2: `src/components/ThemeStyle.astro`** (injeta as vars do preset ativo)

```astro
---
import { resolveTheme, varsToCss } from '../lib/theme';
const { vars } = resolveTheme();
const css = varsToCss(vars);
---
<style set:html={css}></style>
```

- [ ] **Step 3: `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import ThemeStyle from '../components/ThemeStyle.astro';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';
interface Props { title: string; description?: string; }
const { title, description = '' } = Astro.props;
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <ThemeStyle />
  </head>
  <body>
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 4: Commit** (build acontece no Task 6, depois que Header/Footer/index existirem)

```bash
git add -A && git commit -m "feat(theme): global.css tokens + ThemeStyle injector + BaseLayout"
```

---

### Task 4: Block registry + renderer + tipos (testado)

**Files:**
- Create: `src/blocks/types.ts`, `src/blocks/registry.ts`, `src/blocks/BlockRenderer.astro`, `src/test/blocks.test.ts`

- [ ] **Step 1: `src/blocks/types.ts`**

```ts
export const BLOCK_TYPES = [
  'hero', 'sobre', 'servicos', 'numeros', 'porqueEscolher',
  'comoFunciona', 'equipe', 'depoimentos', 'antesDepois',
  'novidades', 'ctaContato',
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export interface Block { type: BlockType; props: Record<string, unknown>; }
```

- [ ] **Step 2: `src/blocks/registry.ts`** (começa vazio — cada task de bloco adiciona sua entrada)

```ts
// Mapa type → componente Astro. Astro não expõe um tipo público estável p/
// componentes, então usamos `unknown` + cast no renderer (seguro: só renderiza).
// Cada Task de bloco adiciona: import + entrada no mapa abaixo.
export const blockRegistry: Record<string, unknown> = {};
```

- [ ] **Step 3: `src/blocks/BlockRenderer.astro`**

```astro
---
import { blockRegistry } from './registry';
import type { Block } from './types';
interface Props { blocks: Block[]; }
const { blocks = [] } = Astro.props;
---
{blocks.map((b) => {
  const Cmp = blockRegistry[b.type] as any;
  return Cmp ? <Cmp {...b.props} /> : null;
})}
```

- [ ] **Step 4: Write the failing test — `src/test/blocks.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { BLOCK_TYPES } from '../blocks/types';
import page from '../data/page.json';

describe('page.json integrity', () => {
  it('every block.type is a known BLOCK_TYPE', () => {
    for (const b of page.blocks) {
      expect(BLOCK_TYPES).toContain(b.type);
    }
  });

  it('every block has a props object', () => {
    for (const b of page.blocks) {
      expect(typeof b.props).toBe('object');
    }
  });
});
```

- [ ] **Step 5: Run test to verify it FAILS**

Run: `cd /c/Projects/clinify && bun run test`
Expected: FAIL — `Cannot find module '../data/page.json'` (page.json criado no Task 5).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(blocks): registry + BlockRenderer + types + integrity test"
```

---

### Task 5: Dados — siteConfig.json + page.json (conteúdo pt-BR)

**Files:**
- Create: `src/data/siteConfig.json`, `src/data/page.json`

- [ ] **Step 1: `src/data/siteConfig.json`**

```json
{
  "name": "Clínica Sorriso",
  "description": "Odontologia de excelência com cuidado gentil. Agende sua avaliação.",
  "phone": "(11) 4002-8922",
  "whatsapp": "5511940028922",
  "email": "contato@clinicasorriso.com.br",
  "address": "Av. Paulista, 1000 — São Paulo, SP",
  "hours": "Seg a Sáb, 9h às 19h",
  "social": { "instagram": "#", "facebook": "#", "youtube": "#" }
}
```

- [ ] **Step 2: `src/data/page.json`** (todos os 11 blocos com conteúdo)

```json
{
  "blocks": [
    { "type": "hero", "props": {
      "eyebrow": "Clínica Odontológica",
      "title": "Um sorriso saudável começa com um cuidado gentil.",
      "lead": "Tratamentos modernos, equipe especializada e atendimento humano para toda a família.",
      "cta": { "label": "Agendar avaliação", "href": "#contato" },
      "rating": { "score": "5,0", "count": "492 avaliações" },
      "doctor": { "name": "Dra. Clara Lima", "role": "Odontologia Geral", "photo": "/images/doctor.jpg" },
      "contact": { "phone": "(11) 4002-8922", "hours": "Seg a Sáb, 9h às 19h" }
    }},
    { "type": "sobre", "props": {
      "image": "/images/about.jpg",
      "badge": "15+ anos de experiência",
      "eyebrow": "Sobre a clínica",
      "title": "Sua jornada para um sorriso mais saudável.",
      "lead": "Unimos tecnologia de ponta e um time acolhedor para que cada visita seja tranquila.",
      "benefits": [
        "Equipe especializada e atualizada",
        "Serviços completos em um só lugar",
        "Tecnologia de diagnóstico moderna",
        "Atendimento de urgência"
      ],
      "cta": { "label": "Conheça a clínica", "href": "#contato" }
    }},
    { "type": "servicos", "props": {
      "eyebrow": "Nossos serviços",
      "title": "Tratamentos de alta qualidade para você.",
      "items": [
        { "title": "Clínico geral", "text": "Prevenção, limpeza e cuidado de rotina." },
        { "title": "Implantes", "text": "Reposição de dentes com naturalidade." },
        { "title": "Estética dental", "text": "Lentes, facetas e harmonização do sorriso." },
        { "title": "Clareamento", "text": "Sorriso mais branco com segurança." }
      ],
      "cta": { "label": "Ver todos os serviços", "href": "#contato" }
    }},
    { "type": "numeros", "props": {
      "stats": [
        { "value": "15+", "label": "Anos de experiência" },
        { "value": "12k", "label": "Pacientes atendidos" },
        { "value": "18", "label": "Especialistas" },
        { "value": "98%", "label": "Satisfação" }
      ]
    }},
    { "type": "porqueEscolher", "props": {
      "eyebrow": "Por que nos escolher",
      "title": "Cuidado completo para o seu sorriso.",
      "image": "/images/why.jpg",
      "features": [
        { "title": "Profissionais experientes", "text": "Time qualificado e atencioso." },
        { "title": "Atendimento personalizado", "text": "Plano sob medida para você." },
        { "title": "Pagamento facilitado", "text": "Condições que cabem no bolso." },
        { "title": "Urgência", "text": "Atendimento quando você precisa." },
        { "title": "Avaliações positivas", "text": "Pacientes que recomendam." },
        { "title": "Tecnologia atual", "text": "Equipamentos de última geração." }
      ]
    }},
    { "type": "comoFunciona", "props": {
      "eyebrow": "Como funciona",
      "title": "Três passos para o seu sorriso.",
      "steps": [
        { "n": "01", "title": "Agende", "text": "Marque sua avaliação online ou por telefone." },
        { "n": "02", "title": "Avaliação", "text": "Diagnóstico e plano de tratamento personalizado." },
        { "n": "03", "title": "Cuidado", "text": "Tratamento com acompanhamento próximo." }
      ]
    }},
    { "type": "equipe", "props": {
      "eyebrow": "Nossa equipe",
      "title": "Dentistas que cuidam de você.",
      "members": [
        { "name": "Dr. João Reis", "role": "Implantodontia", "photo": "/images/team-1.jpg" },
        { "name": "Dra. Marina Alves", "role": "Ortodontia", "photo": "/images/team-2.jpg" },
        { "name": "Dr. Pedro Nunes", "role": "Endodontia", "photo": "/images/team-3.jpg" },
        { "name": "Dra. Sofia Castro", "role": "Estética", "photo": "/images/team-4.jpg" }
      ]
    }},
    { "type": "depoimentos", "props": {
      "eyebrow": "Depoimentos",
      "title": "O que nossos pacientes dizem.",
      "rating": { "score": "4,9", "label": "média de satisfação" },
      "items": [
        { "quote": "Atendimento impecável, saí sorrindo de verdade.", "name": "Roberto L.", "role": "Paciente" },
        { "quote": "Equipe atenciosa e clínica linda. Recomendo!", "name": "Banson D.", "role": "Paciente" },
        { "quote": "Resolveram minha urgência no mesmo dia.", "name": "Thomas L.", "role": "Paciente" }
      ]
    }},
    { "type": "antesDepois", "props": {
      "eyebrow": "Resultados",
      "title": "Antes e depois.",
      "items": [
        { "label": "Clareamento", "before": "/images/before-1.jpg", "after": "/images/after-1.jpg" },
        { "label": "Facetas", "before": "/images/before-2.jpg", "after": "/images/after-2.jpg" }
      ]
    }},
    { "type": "novidades", "props": {
      "eyebrow": "Novidades",
      "title": "Confira nossos artigos.",
      "items": [
        { "title": "A importância da consulta regular", "excerpt": "Por que visitar o dentista a cada 6 meses.", "image": "/images/post-1.jpg", "href": "#" },
        { "title": "5 benefícios do clareamento", "excerpt": "O que muda no seu sorriso.", "image": "/images/post-2.jpg", "href": "#" },
        { "title": "Implantes: o que você precisa saber", "excerpt": "Tire suas dúvidas sobre o procedimento.", "image": "/images/post-3.jpg", "href": "#" }
      ]
    }},
    { "type": "ctaContato", "props": {
      "eyebrow": "Fale com a gente",
      "title": "Agende sua avaliação gratuita.",
      "services": ["Clínico geral", "Implantes", "Estética dental", "Clareamento", "Ortodontia"]
    }}
  ]
}
```

- [ ] **Step 3: Run the blocks test to verify it now PASSES**

Run: `cd /c/Projects/clinify && bun run test`
Expected: PASS (page.json existe; todos os types são válidos).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(data): siteConfig + page.json com conteúdo pt-BR (11 blocos)"
```

---

### Task 6: Header, Footer e index.astro (primeiro build verde)

**Files:**
- Create: `src/components/layout/Header.astro`, `src/components/layout/Footer.astro`, `src/pages/index.astro`

- [ ] **Step 1: `src/components/layout/Header.astro`**

```astro
---
import site from '../../data/siteConfig.json';
const nav = [
  { label: 'Início', href: '#' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Equipe', href: '#equipe' },
  { label: 'Contato', href: '#contato' },
];
---
<header class="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-border">
  <div class="container-x flex items-center justify-between h-16">
    <a href="/" class="font-display text-xl font-bold text-primary">{site.name}</a>
    <nav class="hidden md:flex items-center gap-7">
      {nav.map((n) => (
        <a href={n.href} class="text-sm text-ink-muted hover:text-primary transition">{n.label}</a>
      ))}
    </nav>
    <a href="#contato" class="btn-accent text-sm">Agendar consulta</a>
  </div>
</header>
```

- [ ] **Step 2: `src/components/layout/Footer.astro`**

```astro
---
import site from '../../data/siteConfig.json';
const year = 2026;
---
<footer class="bg-primary text-white/80">
  <div class="container-x py-14 grid gap-10 md:grid-cols-4">
    <div class="md:col-span-2">
      <p class="font-display text-xl font-bold text-white">{site.name}</p>
      <p class="mt-3 max-w-sm text-sm">{site.description}</p>
    </div>
    <div>
      <p class="font-semibold text-white mb-3">Contato</p>
      <p class="text-sm">{site.phone}</p>
      <p class="text-sm">{site.email}</p>
      <p class="text-sm">{site.address}</p>
    </div>
    <div>
      <p class="font-semibold text-white mb-3">Horário</p>
      <p class="text-sm">{site.hours}</p>
    </div>
  </div>
  <div class="border-t border-white/15">
    <div class="container-x py-5 text-xs text-white/60">© {year} {site.name}. Todos os direitos reservados.</div>
  </div>
</footer>
```

- [ ] **Step 3: `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BlockRenderer from '../blocks/BlockRenderer.astro';
import page from '../data/page.json';
import site from '../data/siteConfig.json';
import type { Block } from '../blocks/types';
const blocks = page.blocks as Block[];
---
<BaseLayout title={site.name} description={site.description}>
  <BlockRenderer blocks={blocks} />
</BaseLayout>
```

- [ ] **Step 4: Build verde (registry ainda vazio → blocos renderizam null, mas build passa)**

Run: `cd /c/Projects/clinify && bun run build`
Expected: build PASS, gera `dist/`. Header e Footer aparecem; miolo vazio (esperado).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(layout): Header + Footer + index wiring (build verde)"
```

---

## Tasks 7–17: Blocos

> **Padrão de cada bloco (repetir):** (a) criar `src/blocks/<Nome>.astro` com `interface Props` tipada lendo as chaves do `page.json`; (b) markup original Dentaire-inspired usando **só tokens semânticos** (`bg-soft`, `text-accent`, `card`, `btn-accent`, `eyebrow`, `section`, `container-x`); (c) registrar em `registry.ts` (import + entrada no mapa); (d) `bun run dev` + `curl` confere a seção; (e) commit. Imagens são placeholders (`public/images/*` pode não existir — `<img>` com `alt`, sem quebrar layout: usar `bg-soft` no container).

---

### Task 7: Bloco `hero`

**Files:**
- Create: `src/blocks/Hero.astro`
- Modify: `src/blocks/registry.ts`

- [ ] **Step 1: `src/blocks/Hero.astro`**

```astro
---
interface Props {
  eyebrow?: string;
  title: string;
  lead?: string;
  cta?: { label: string; href: string };
  rating?: { score: string; count: string };
  doctor?: { name: string; role: string; photo?: string };
  contact?: { phone: string; hours: string };
}
const { eyebrow, title, lead, cta, rating, doctor, contact } = Astro.props;
---
<section class="bg-soft">
  <div class="container-x section grid gap-12 lg:grid-cols-2 items-center">
    <div>
      {eyebrow && <span class="eyebrow">{eyebrow}</span>}
      <h1 class="text-4xl md:text-5xl leading-tight">{title}</h1>
      {lead && <p class="mt-5 text-lg max-w-xl">{lead}</p>}
      <div class="mt-8 flex flex-wrap items-center gap-5">
        {cta && <a href={cta.href} class="btn-accent">{cta.label}</a>}
        {rating && (
          <div class="text-sm">
            <span class="text-accent font-semibold">★ {rating.score}</span>
            <span class="text-ink-muted"> · {rating.count}</span>
          </div>
        )}
      </div>
    </div>
    <div class="relative">
      <div class="aspect-[4/3] rounded-2xl bg-surface border border-border overflow-hidden">
        {doctor?.photo && <img src={doctor.photo} alt={doctor.name} class="w-full h-full object-cover" />}
      </div>
      {doctor && (
        <div class="card absolute -bottom-5 left-5 px-5 py-3 shadow-sm">
          <p class="font-semibold text-ink">{doctor.name}</p>
          <p class="text-sm text-ink-muted">{doctor.role}</p>
        </div>
      )}
      {contact && (
        <div class="card absolute -top-5 right-5 px-5 py-3 shadow-sm">
          <p class="text-sm font-semibold text-ink">{contact.phone}</p>
          <p class="text-xs text-ink-muted">{contact.hours}</p>
        </div>
      )}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Registrar em `src/blocks/registry.ts`**

```ts
import Hero from './Hero.astro';

export const blockRegistry: Record<string, unknown> = {
  hero: Hero,
};
```

- [ ] **Step 3: Verificar**

Run: `cd /c/Projects/clinify && bun run build`
Expected: PASS. Opcional dev: `bun run dev` e `curl -s http://localhost:4321/ | grep -o "Um sorriso saudável"` → casa.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(block): hero"
```

---

### Task 8: Bloco `sobre`

**Files:** Create `src/blocks/Sobre.astro`; Modify `src/blocks/registry.ts`

- [ ] **Step 1: `src/blocks/Sobre.astro`**

```astro
---
interface Props {
  image?: string;
  badge?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  benefits?: string[];
  cta?: { label: string; href: string };
}
const { image, badge, eyebrow, title, lead, benefits = [], cta } = Astro.props;
---
<section id="sobre" class="section">
  <div class="container-x grid gap-12 lg:grid-cols-2 items-center">
    <div class="relative">
      <div class="aspect-[4/3] rounded-2xl bg-soft border border-border overflow-hidden">
        {image && <img src={image} alt={title} class="w-full h-full object-cover" />}
      </div>
      {badge && <div class="btn-primary absolute -bottom-4 left-6 text-sm pointer-events-none">{badge}</div>}
    </div>
    <div>
      {eyebrow && <span class="eyebrow">{eyebrow}</span>}
      <h2 class="text-3xl md:text-4xl">{title}</h2>
      {lead && <p class="mt-4 text-lg">{lead}</p>}
      <ul class="mt-6 grid sm:grid-cols-2 gap-3">
        {benefits.map((b) => (
          <li class="flex items-start gap-3">
            <span class="text-accent mt-0.5">✓</span>
            <span class="text-ink-muted">{b}</span>
          </li>
        ))}
      </ul>
      {cta && <a href={cta.href} class="btn-ghost mt-8">{cta.label}</a>}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Registrar** — adicionar em `registry.ts`: `import Sobre from './Sobre.astro';` e `sobre: Sobre,` no mapa.

- [ ] **Step 3: Verificar** — `bun run build` → PASS.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(block): sobre"`

---

### Task 9: Bloco `servicos`

**Files:** Create `src/blocks/Servicos.astro`; Modify `src/blocks/registry.ts`

- [ ] **Step 1: `src/blocks/Servicos.astro`**

```astro
---
interface ServiceItem { title: string; text: string; }
interface Props { eyebrow?: string; title: string; items?: ServiceItem[]; cta?: { label: string; href: string }; }
const { eyebrow, title, items = [], cta } = Astro.props;
---
<section id="servicos" class="section bg-soft">
  <div class="container-x">
    <div class="max-w-2xl">
      {eyebrow && <span class="eyebrow">{eyebrow}</span>}
      <h2 class="text-3xl md:text-4xl">{title}</h2>
    </div>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <article class="card p-6 hover:border-secondary transition">
          <span class="ic mb-4">+</span>
          <h3 class="text-lg">{s.title}</h3>
          <p class="mt-2 text-sm text-ink-muted">{s.text}</p>
        </article>
      ))}
    </div>
    {cta && <div class="mt-10"><a href={cta.href} class="btn-accent">{cta.label}</a></div>}
  </div>
</section>
```

- [ ] **Step 2: Registrar** — `import Servicos from './Servicos.astro';` + `servicos: Servicos,`.
- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git commit -am "feat(block): servicos"`

---

### Task 10: Bloco `numeros`

**Files:** Create `src/blocks/Numeros.astro`; Modify `src/blocks/registry.ts`

- [ ] **Step 1: `src/blocks/Numeros.astro`**

```astro
---
interface Stat { value: string; label: string; }
interface Props { stats?: Stat[]; }
const { stats = [] } = Astro.props;
---
<section class="bg-primary text-white">
  <div class="container-x py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
    {stats.map((s) => (
      <div>
        <p class="font-display text-4xl font-bold text-accent">{s.value}</p>
        <p class="mt-1 text-sm text-white/80">{s.label}</p>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Registrar** — `import Numeros from './Numeros.astro';` + `numeros: Numeros,`.
- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git commit -am "feat(block): numeros"`

---

### Task 11: Bloco `porqueEscolher`

**Files:** Create `src/blocks/PorqueEscolher.astro`; Modify `src/blocks/registry.ts`

- [ ] **Step 1: `src/blocks/PorqueEscolher.astro`**

```astro
---
interface Feature { title: string; text: string; }
interface Props { eyebrow?: string; title: string; image?: string; features?: Feature[]; }
const { eyebrow, title, image, features = [] } = Astro.props;
const left = features.slice(0, 3);
const right = features.slice(3, 6);
const Cell = (f: Feature) => (
  <div class="card p-5">
    <span class="ic mb-3">★</span>
    <h3 class="text-base">{f.title}</h3>
    <p class="mt-1 text-sm text-ink-muted">{f.text}</p>
  </div>
);
---
<section class="section">
  <div class="container-x">
    <div class="max-w-2xl mb-10">
      {eyebrow && <span class="eyebrow">{eyebrow}</span>}
      <h2 class="text-3xl md:text-4xl">{title}</h2>
    </div>
    <div class="grid gap-6 lg:grid-cols-3 items-stretch">
      <div class="grid gap-6 content-center">{left.map(Cell)}</div>
      <div class="rounded-2xl bg-soft border border-border overflow-hidden min-h-[16rem]">
        {image && <img src={image} alt={title} class="w-full h-full object-cover" />}
      </div>
      <div class="grid gap-6 content-center">{right.map(Cell)}</div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Registrar** — `import PorqueEscolher from './PorqueEscolher.astro';` + `porqueEscolher: PorqueEscolher,`.
- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git commit -am "feat(block): porqueEscolher"`

---

### Task 12: Bloco `comoFunciona`

**Files:** Create `src/blocks/ComoFunciona.astro`; Modify `src/blocks/registry.ts`

- [ ] **Step 1: `src/blocks/ComoFunciona.astro`**

```astro
---
interface Step { n: string; title: string; text: string; }
interface Props { eyebrow?: string; title: string; steps?: Step[]; }
const { eyebrow, title, steps = [] } = Astro.props;
---
<section class="section bg-soft">
  <div class="container-x">
    <div class="max-w-2xl mb-10">
      {eyebrow && <span class="eyebrow">{eyebrow}</span>}
      <h2 class="text-3xl md:text-4xl">{title}</h2>
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      {steps.map((s) => (
        <div class="card p-7">
          <span class="font-display text-3xl font-bold text-accent">{s.n}</span>
          <h3 class="mt-3 text-lg">{s.title}</h3>
          <p class="mt-2 text-sm text-ink-muted">{s.text}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Registrar** — `import ComoFunciona from './ComoFunciona.astro';` + `comoFunciona: ComoFunciona,`.
- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git commit -am "feat(block): comoFunciona"`

---

### Task 13: Bloco `equipe`

**Files:** Create `src/blocks/Equipe.astro`; Modify `src/blocks/registry.ts`

- [ ] **Step 1: `src/blocks/Equipe.astro`**

```astro
---
interface Member { name: string; role: string; photo?: string; }
interface Props { eyebrow?: string; title: string; members?: Member[]; }
const { eyebrow, title, members = [] } = Astro.props;
---
<section id="equipe" class="section">
  <div class="container-x">
    <div class="max-w-2xl mb-10">
      {eyebrow && <span class="eyebrow">{eyebrow}</span>}
      <h2 class="text-3xl md:text-4xl">{title}</h2>
    </div>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((m) => (
        <article class="card overflow-hidden">
          <div class="aspect-[3/4] bg-soft">
            {m.photo && <img src={m.photo} alt={m.name} class="w-full h-full object-cover" />}
          </div>
          <div class="p-5">
            <h3 class="text-base">{m.name}</h3>
            <p class="text-sm text-accent">{m.role}</p>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Registrar** — `import Equipe from './Equipe.astro';` + `equipe: Equipe,`.
- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git commit -am "feat(block): equipe"`

---

### Task 14: Bloco `depoimentos`

**Files:** Create `src/blocks/Depoimentos.astro`; Modify `src/blocks/registry.ts`

- [ ] **Step 1: `src/blocks/Depoimentos.astro`**

```astro
---
interface Item { quote: string; name: string; role: string; }
interface Props { eyebrow?: string; title: string; rating?: { score: string; label: string }; items?: Item[]; }
const { eyebrow, title, rating, items = [] } = Astro.props;
---
<section class="section bg-soft">
  <div class="container-x">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-10">
      <div class="max-w-2xl">
        {eyebrow && <span class="eyebrow">{eyebrow}</span>}
        <h2 class="text-3xl md:text-4xl">{title}</h2>
      </div>
      {rating && (
        <div class="text-right">
          <p class="font-display text-3xl font-bold text-accent">★ {rating.score}</p>
          <p class="text-sm text-ink-muted">{rating.label}</p>
        </div>
      )}
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      {items.map((t) => (
        <figure class="card p-7">
          <blockquote class="text-ink">“{t.quote}”</blockquote>
          <figcaption class="mt-5">
            <p class="font-semibold text-ink">{t.name}</p>
            <p class="text-sm text-ink-muted">{t.role}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Registrar** — `import Depoimentos from './Depoimentos.astro';` + `depoimentos: Depoimentos,`.
- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git commit -am "feat(block): depoimentos"`

---

### Task 15: Bloco `antesDepois`

**Files:** Create `src/blocks/AntesDepois.astro`; Modify `src/blocks/registry.ts`

> Estágio 1: grid lado-a-lado simples (sem slider). Swiper fica pra refino posterior.

- [ ] **Step 1: `src/blocks/AntesDepois.astro`**

```astro
---
interface Item { label: string; before?: string; after?: string; }
interface Props { eyebrow?: string; title: string; items?: Item[]; }
const { eyebrow, title, items = [] } = Astro.props;
---
<section class="section">
  <div class="container-x">
    <div class="max-w-2xl mb-10">
      {eyebrow && <span class="eyebrow">{eyebrow}</span>}
      <h2 class="text-3xl md:text-4xl">{title}</h2>
    </div>
    <div class="grid gap-8 md:grid-cols-2">
      {items.map((it) => (
        <div class="card p-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="aspect-square rounded-xl bg-soft overflow-hidden relative">
              {it.before && <img src={it.before} alt={`Antes — ${it.label}`} class="w-full h-full object-cover" />}
              <span class="absolute top-2 left-2 text-xs bg-ink/70 text-white px-2 py-0.5 rounded">Antes</span>
            </div>
            <div class="aspect-square rounded-xl bg-soft overflow-hidden relative">
              {it.after && <img src={it.after} alt={`Depois — ${it.label}`} class="w-full h-full object-cover" />}
              <span class="absolute top-2 left-2 text-xs bg-accent text-accent-ink px-2 py-0.5 rounded">Depois</span>
            </div>
          </div>
          <p class="mt-3 text-sm font-medium text-ink">{it.label}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Registrar** — `import AntesDepois from './AntesDepois.astro';` + `antesDepois: AntesDepois,`.
- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git commit -am "feat(block): antesDepois"`

---

### Task 16: Bloco `novidades`

**Files:** Create `src/blocks/Novidades.astro`; Modify `src/blocks/registry.ts`

> Estágio 1: lê de `props.items` (mock). Estágio 2 troca a fonte pra coleção do blog.

- [ ] **Step 1: `src/blocks/Novidades.astro`**

```astro
---
interface Item { title: string; excerpt: string; image?: string; href: string; }
interface Props { eyebrow?: string; title: string; items?: Item[]; }
const { eyebrow, title, items = [] } = Astro.props;
---
<section class="section bg-soft">
  <div class="container-x">
    <div class="max-w-2xl mb-10">
      {eyebrow && <span class="eyebrow">{eyebrow}</span>}
      <h2 class="text-3xl md:text-4xl">{title}</h2>
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      {items.map((p) => (
        <a href={p.href} class="card overflow-hidden group">
          <div class="aspect-[16/10] bg-surface overflow-hidden">
            {p.image && <img src={p.image} alt={p.title} class="w-full h-full object-cover group-hover:scale-105 transition" />}
          </div>
          <div class="p-6">
            <h3 class="text-lg group-hover:text-primary transition">{p.title}</h3>
            <p class="mt-2 text-sm text-ink-muted">{p.excerpt}</p>
            <span class="mt-4 inline-block text-sm font-medium text-accent">Ler mais →</span>
          </div>
        </a>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Registrar** — `import Novidades from './Novidades.astro';` + `novidades: Novidades,`.
- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git commit -am "feat(block): novidades"`

---

### Task 17: Bloco `ctaContato` (com formulário de lead)

**Files:** Create `src/blocks/CtaContato.astro`; Modify `src/blocks/registry.ts`

> Estágio 1: form com `action="/api/subscribe"` (endpoint só existe no Estágio 2 — aqui é markup pronto pro wiring). Campos: nome, telefone, email, serviço, mensagem.

- [ ] **Step 1: `src/blocks/CtaContato.astro`**

```astro
---
import site from '../data/siteConfig.json';
interface Props { eyebrow?: string; title: string; services?: string[]; }
const { eyebrow, title, services = [] } = Astro.props;
---
<section id="contato" class="section">
  <div class="container-x grid gap-10 lg:grid-cols-2 items-start">
    <div>
      {eyebrow && <span class="eyebrow">{eyebrow}</span>}
      <h2 class="text-3xl md:text-4xl">{title}</h2>
      <ul class="mt-6 space-y-3 text-ink-muted">
        <li><span class="font-semibold text-ink">Telefone:</span> {site.phone}</li>
        <li><span class="font-semibold text-ink">E-mail:</span> {site.email}</li>
        <li><span class="font-semibold text-ink">Endereço:</span> {site.address}</li>
        <li><span class="font-semibold text-ink">Horário:</span> {site.hours}</li>
      </ul>
    </div>
    <form action="/api/subscribe" method="POST" class="card p-6 grid gap-4">
      <div class="grid sm:grid-cols-2 gap-4">
        <input name="nome" required placeholder="Seu nome" class="rounded-xl border border-border bg-surface px-4 py-3 min-h-[44px]" />
        <input name="telefone" required placeholder="Telefone / WhatsApp" class="rounded-xl border border-border bg-surface px-4 py-3 min-h-[44px]" />
      </div>
      <input name="email" type="email" placeholder="E-mail" class="rounded-xl border border-border bg-surface px-4 py-3 min-h-[44px]" />
      <select name="servico" class="rounded-xl border border-border bg-surface px-4 py-3 min-h-[44px] text-ink-muted">
        <option value="">Serviço de interesse</option>
        {services.map((s) => <option value={s}>{s}</option>)}
      </select>
      <textarea name="mensagem" rows="3" placeholder="Mensagem (opcional)" class="rounded-xl border border-border bg-surface px-4 py-3"></textarea>
      <button type="submit" class="btn-accent w-full">Agendar avaliação</button>
    </form>
  </div>
</section>
```

- [ ] **Step 2: Registrar** — `import CtaContato from './CtaContato.astro';` + `ctaContato: CtaContato,`.
- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git commit -am "feat(block): ctaContato + form de lead (action pronta p/ estágio 2)"`

---

### Task 18: Verificação final — site completo + troca de tema + DESIGN.md

**Files:** Create `DESIGN.md`

- [ ] **Step 1: Build estático e checar todas as seções no `dist/`**

Run:
```bash
cd /c/Projects/clinify && bun run build && grep -oE "(Um sorriso saudável|Nossos serviços|Nossa equipe|Agende sua avaliação)" dist/index.html | sort -u
```
Expected: as 4 strings aparecem → os 11 blocos renderizaram no HTML estático.

- [ ] **Step 2: Provar a troca de tema (o coração da multi-especialidade)**

Run:
```bash
cd /c/Projects/clinify
# troca preset dental → harmonizacao (usa fs, não require — compatível c/ ESM)
node -e "const fs=require('fs');const f='src/data/theme.json';const j=JSON.parse(fs.readFileSync(f,'utf8'));j.preset='harmonizacao';fs.writeFileSync(f,JSON.stringify(j,null,2))"
bun run build && grep -o "#7A5C57" dist/index.html | head -1
# reverte pra dental
node -e "const fs=require('fs');const f='src/data/theme.json';const j=JSON.parse(fs.readFileSync(f,'utf8'));j.preset='dental';fs.writeFileSync(f,JSON.stringify(j,null,2))"
bun run build && grep -o "#0E384C" dist/index.html | head -1
```
Expected: 1ª grep acha `#7A5C57` (primary harmonização), 2ª acha `#0E384C` (primary dental). **Mesmo HTML, paleta trocada por 1 string — zero componente tocado.**

- [ ] **Step 3: `DESIGN.md`** (tokens Dentaire documentados)

```markdown
# DESIGN — Clinify (Dentaire-inspired)

**North star:** clínica moderna, clean, confiável-acolhedora. Inspiração: https://html.awaikenthemes.com/dentaire/ (não é cópia — referência de paleta, tipografia e estrutura de seções).

## Tokens (preset default `dental`)
Fonte de verdade: `src/data/themes/dental.json` → injetado como CSS var por `ThemeStyle.astro` → consumido pelos tokens semânticos do Tailwind (`tailwind.config.mjs`).

| Token | Hex | Papel |
|---|---|---|
| primary | #0E384C | petróleo (marca, headings, footer) |
| accent | #FFA800 | âmbar (CTA, destaques, números) |
| secondary | #1E84B5 | azul clínico (ícones, hovers) |
| ink | #0E384C | texto primário |
| ink-muted | #527282 | texto secundário |
| soft | #EFF8FF | fundo de seção alternada |
| bg / surface | #FFFFFF | fundo / cards |
| border | #E1ECF2 | bordas hairline |
| accent-ink | #0E384C | texto sobre botão âmbar |

**Tipografia:** Poppins (300–800) em tudo (display + body).
**Forma:** cards `rounded-2xl`, botões `rounded-full`, muito whitespace (`section` = py 16/24), flat com borda hairline.

## Regras
- Nenhum hex hardcoded em componente — só classes de token (`bg-soft`, `text-accent`, `card`, `btn-accent`).
- Multi-especialidade = trocar `preset` em `src/data/theme.json`. Adicionar nicho = novo `themes/<nicho>.json`.
- Touch targets ≥ 44px, `prefers-reduced-motion` respeitado (global.css), `lang="pt-BR"`.

## Componentes utilitários (global.css)
`.container-x` `.section` `.eyebrow` `.btn-accent` `.btn-primary` `.btn-ghost` `.card` `.ic`
```

- [ ] **Step 4: Commit final do Estágio 1**

```bash
git add -A && git commit -m "docs: DESIGN.md + verificação estágio 1 (site completo, troca de tema)"
```

---

## Critério de pronto — Estágio 1 (checklist do spec §8)

- [ ] `bun run dev` sobe; home renderiza os 11 blocos de `page.json` (Task 18.1)
- [ ] Trocar `theme.json` muda a paleta inteira sem tocar componente (Task 18.2)
- [ ] Form de contato existe e aponta pra `/api/subscribe` (wiring real no Estágio 2) (Task 17)
- [ ] `bun run build` passa sem erro (Tasks 6–18)
- [ ] Visual fiel à inspiração Dentaire (petróleo+âmbar, Poppins, cards arredondados) (DESIGN.md)
- [ ] 2 testes de lógica verdes: theme resolver + integridade de page.json (Tasks 2, 4)

> **Fora de escopo do Estágio 1 (vai pro Estágio 2):** CMS embarcado, admin visual, persistência via repoAtomicCommit, `/api/subscribe` funcional, blog real como Novidades, presets extras de especialidade.
</content>
