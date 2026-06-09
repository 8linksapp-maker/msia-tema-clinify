# Clinify — Páginas únicas por menu (SEO) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para implementar task a task. Steps usam checkbox (`- [ ]`).

**Goal:** Converter o site one-page em **páginas únicas por item de menu** (serviços, equipe, sobre, contato, agendar) — cada uma com URL, `<title>`, `<meta description>` e `<h1>` próprios, pra SEO. Reusa o sistema de blocos existente.

**Architecture:** Rota data-driven `src/pages/[slug].astro` + `getStaticPaths()` lê `src/data/pages/*.json` (cada arquivo = `{ meta, blocks }`). Novo bloco `pageHeader` dá o `<h1>` único + breadcrumb por subpágina. Home (`index.astro` + `page.json`) permanece como overview, com CTAs apontando pras páginas dedicadas. BaseLayout ganha canonical + Open Graph; astro.config ganha `site` + sitemap.

**Tech Stack:** Astro 5.1, Tailwind 3, `@astrojs/sitemap`, Bun, Vitest.

**Base:** Estágio 1 entregue (11 blocos, `BlockRenderer`, `registry.ts`, tokens). Ver `docs/superpowers/plans/2026-06-09-clinify-estagio1-tema-standalone.md`.

---

## File Structure (delta)

```
NOVO:
  src/blocks/PageHeader.astro          ← bloco pageHeader (h1 + breadcrumb)
  src/pages/[slug].astro               ← rota data-driven (getStaticPaths)
  src/data/pages/servicos.json
  src/data/pages/equipe.json
  src/data/pages/sobre.json
  src/data/pages/contato.json
  src/data/pages/agendar.json
  public/robots.txt
MODIFICA:
  src/blocks/types.ts                  ← + 'pageHeader' em BLOCK_TYPES
  src/blocks/registry.ts               ← + import/entry PageHeader
  src/layouts/BaseLayout.astro         ← canonical + OG + ogType prop
  src/components/layout/Header.astro    ← nav real + estado ativo + /agendar
  src/components/layout/Footer.astro    ← quick links → rotas reais
  src/data/page.json                   ← CTAs da home → rotas dedicadas
  astro.config.mjs                     ← site: + sitemap()
  package.json                         ← + @astrojs/sitemap
  src/test/blocks.test.ts              ← valida block types das pages/*.json
```

**Regra herdada:** zero hex em componente, só tokens. `pageHeader` segue o padrão dos outros blocos.

---

### Task 1: Bloco `pageHeader` (h1 único + breadcrumb)

**Files:** Create `src/blocks/PageHeader.astro`; Modify `src/blocks/types.ts`, `src/blocks/registry.ts`

- [ ] **Step 1: `src/blocks/PageHeader.astro`**

```astro
---
interface Crumb { label: string; href: string; }
interface Props { eyebrow?: string; title: string; lead?: string; breadcrumb?: Crumb[]; }
const { eyebrow, title, lead, breadcrumb = [] } = Astro.props;
---
<section class="bg-soft">
  <div class="container-x py-12 md:py-16">
    {breadcrumb.length > 0 && (
      <nav aria-label="Trilha" class="mb-4">
        <ol class="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          {breadcrumb.map((c, i) => (
            <li class="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i < breadcrumb.length - 1
                ? <a href={c.href} class="hover:text-primary transition">{c.label}</a>
                : <span class="text-ink" aria-current="page">{c.label}</span>}
            </li>
          ))}
        </ol>
      </nav>
    )}
    {eyebrow && <span class="eyebrow">{eyebrow}</span>}
    <h1 class="text-4xl md:text-5xl">{title}</h1>
    {lead && <p class="mt-4 text-lg max-w-2xl">{lead}</p>}
  </div>
</section>
```

- [ ] **Step 2: `src/blocks/types.ts`** — adicionar `'pageHeader'` ao array `BLOCK_TYPES` (primeira posição):

```ts
export const BLOCK_TYPES = [
  'pageHeader',
  'hero', 'sobre', 'servicos', 'numeros', 'porqueEscolher',
  'comoFunciona', 'equipe', 'depoimentos', 'antesDepois',
  'novidades', 'ctaContato',
] as const;
```

- [ ] **Step 3: `src/blocks/registry.ts`** — adicionar `import PageHeader from './PageHeader.astro';` no topo e `pageHeader: PageHeader,` no mapa.

- [ ] **Step 4: Verificar** — `bun run build` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(block): pageHeader (h1 + breadcrumb p/ subpáginas)"`

---

### Task 2: BaseLayout — canonical + Open Graph

**Files:** Modify `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Reescrever `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import ThemeStyle from '../components/ThemeStyle.astro';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';
interface Props { title: string; description?: string; ogType?: string; }
const { title, description = '', ogType = 'website' } = Astro.props;
const canonical = Astro.site
  ? new URL(Astro.url.pathname, Astro.site).href
  : Astro.url.pathname;
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <link rel="canonical" href={canonical} />
    <meta property="og:type" content={ogType} />
    <meta property="og:title" content={title} />
    {description && <meta property="og:description" content={description} />}
    <meta property="og:url" content={canonical} />
    <meta name="twitter:card" content="summary_large_image" />
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

- [ ] **Step 2: Verificar** — `bun run build` → PASS.

- [ ] **Step 3: Commit** — `git commit -am "feat(seo): canonical + Open Graph no BaseLayout"`

---

### Task 3: astro.config — site + sitemap + robots

**Files:** Modify `astro.config.mjs`, `package.json`; Create `public/robots.txt`

- [ ] **Step 1: Instalar sitemap** — `cd /c/Projects/clinify && bun add @astrojs/sitemap`

- [ ] **Step 2: `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://clinicasorriso.com.br',
  output: 'static',
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
});
```

> ⚠️ `site` é placeholder — Bruno troca pelo domínio real depois. É necessário pra canonical e sitemap funcionarem.

- [ ] **Step 3: `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://clinicasorriso.com.br/sitemap-index.xml
```

- [ ] **Step 4: Verificar** — `bun run build` então `ls dist/sitemap-index.xml` → existe.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(seo): site config + sitemap + robots.txt"`

---

### Task 4: Rota data-driven `[slug].astro`

**Files:** Create `src/pages/[slug].astro`

- [ ] **Step 1: `src/pages/[slug].astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BlockRenderer from '../blocks/BlockRenderer.astro';
import type { Block } from '../blocks/types';

interface PageData { meta: { title: string; description: string }; blocks: Block[]; }

export function getStaticPaths() {
  const mods = import.meta.glob('../data/pages/*.json', { eager: true });
  return Object.entries(mods).map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace('.json', '');
    return { params: { slug }, props: { page: (mod as any).default ?? mod } };
  });
}

const { page } = Astro.props as { page: PageData };
---
<BaseLayout title={page.meta.title} description={page.meta.description}>
  <BlockRenderer blocks={page.blocks} />
</BaseLayout>
```

> Roda no build (`output: 'static'`) → gera `/servicos`, `/equipe`, etc. como HTML estático. Não colide com o blog (`/blog/[slug]`, Estágio 2) porque o blog mora sob `/blog/`.

- [ ] **Step 2: Verificar** — build só passa depois das pages JSON (Task 5). Segue.

---

### Task 5: Conteúdo das 5 páginas (`src/data/pages/*.json`)

**Files:** Create `src/data/pages/{servicos,equipe,sobre,contato,agendar}.json`

> **Reuso de arrays:** onde diz "copiar array de `page.json`", pega o array EXATO do bloco correspondente em `src/data/page.json` (mesmas chaves/valores). Não reescrever conteúdo — é DRY proposital.

- [ ] **Step 1: `src/data/pages/servicos.json`**

```json
{
  "meta": {
    "title": "Serviços odontológicos — Clínica Sorriso",
    "description": "Clínico geral, implantes, estética dental e clareamento. Conheça todos os tratamentos da Clínica Sorriso e agende sua avaliação."
  },
  "blocks": [
    { "type": "pageHeader", "props": {
      "eyebrow": "Nossos serviços",
      "title": "Tratamentos de alta qualidade para você.",
      "lead": "Cuidado completo para o seu sorriso, do preventivo ao estético.",
      "breadcrumb": [ { "label": "Início", "href": "/" }, { "label": "Serviços", "href": "/servicos" } ]
    }},
    { "type": "servicos", "props": { "items": "<<COPIAR items do bloco servicos em page.json>>", "cta": { "label": "Agendar avaliação", "href": "/agendar" } }},
    { "type": "porqueEscolher", "props": { "eyebrow": "Por que nos escolher", "title": "Cuidado completo para o seu sorriso.", "image": "/images/why.jpg", "features": "<<COPIAR features do bloco porqueEscolher em page.json>>" }},
    { "type": "ctaContato", "props": { "eyebrow": "Fale com a gente", "title": "Agende sua avaliação gratuita.", "services": "<<COPIAR services do bloco ctaContato em page.json>>" }}
  ]
}
```

> Substituir os 3 marcadores `<<COPIAR ...>>` pelos arrays reais de `page.json`. (Servicos `items`, PorqueEscolher `features`, CtaContato `services`.)

- [ ] **Step 2: `src/data/pages/equipe.json`**

```json
{
  "meta": {
    "title": "Nossa equipe de dentistas — Clínica Sorriso",
    "description": "Conheça os especialistas da Clínica Sorriso: implantodontia, ortodontia, endodontia e estética. Profissionais experientes e atenciosos."
  },
  "blocks": [
    { "type": "pageHeader", "props": {
      "eyebrow": "Nossa equipe",
      "title": "Dentistas que cuidam de você.",
      "lead": "Especialistas experientes para cada necessidade do seu sorriso.",
      "breadcrumb": [ { "label": "Início", "href": "/" }, { "label": "Equipe", "href": "/equipe" } ]
    }},
    { "type": "equipe", "props": { "members": "<<COPIAR members do bloco equipe em page.json>>" }},
    { "type": "numeros", "props": { "stats": "<<COPIAR stats do bloco numeros em page.json>>" }},
    { "type": "ctaContato", "props": { "eyebrow": "Fale com a gente", "title": "Agende sua avaliação gratuita.", "services": "<<COPIAR services do bloco ctaContato em page.json>>" }}
  ]
}
```

- [ ] **Step 3: `src/data/pages/sobre.json`**

```json
{
  "meta": {
    "title": "Sobre a Clínica Sorriso",
    "description": "15+ anos cuidando do seu sorriso com tecnologia moderna e atendimento humano. Conheça a história e os valores da Clínica Sorriso."
  },
  "blocks": [
    { "type": "pageHeader", "props": {
      "eyebrow": "Sobre a clínica",
      "title": "Sua jornada para um sorriso mais saudável.",
      "lead": "Tecnologia de ponta e um time acolhedor para cada visita tranquila.",
      "breadcrumb": [ { "label": "Início", "href": "/" }, { "label": "Sobre", "href": "/sobre" } ]
    }},
    { "type": "sobre", "props": "<<COPIAR props inteiras do bloco sobre em page.json, mas REMOVER a chave eyebrow (já está no pageHeader)>>" },
    { "type": "numeros", "props": { "stats": "<<COPIAR stats do bloco numeros em page.json>>" }},
    { "type": "comoFunciona", "props": { "eyebrow": "Como funciona", "title": "Três passos para o seu sorriso.", "steps": "<<COPIAR steps do bloco comoFunciona em page.json>>" }},
    { "type": "depoimentos", "props": { "eyebrow": "Depoimentos", "title": "O que nossos pacientes dizem.", "rating": { "score": "4,9", "label": "média de satisfação" }, "items": "<<COPIAR items do bloco depoimentos em page.json>>" }},
    { "type": "ctaContato", "props": { "eyebrow": "Fale com a gente", "title": "Agende sua avaliação gratuita.", "services": "<<COPIAR services do bloco ctaContato em page.json>>" }}
  ]
}
```

- [ ] **Step 4: `src/data/pages/contato.json`**

```json
{
  "meta": {
    "title": "Contato — Clínica Sorriso",
    "description": "Fale com a Clínica Sorriso: telefone, e-mail, endereço e horários de atendimento. Tire suas dúvidas ou agende uma avaliação."
  },
  "blocks": [
    { "type": "pageHeader", "props": {
      "eyebrow": "Fale com a gente",
      "title": "Estamos prontos para te atender.",
      "lead": "Entre em contato pelo canal que preferir ou envie sua mensagem.",
      "breadcrumb": [ { "label": "Início", "href": "/" }, { "label": "Contato", "href": "/contato" } ]
    }},
    { "type": "ctaContato", "props": { "eyebrow": "Envie uma mensagem", "title": "Vamos conversar sobre o seu sorriso.", "services": "<<COPIAR services do bloco ctaContato em page.json>>" }}
  ]
}
```

- [ ] **Step 5: `src/data/pages/agendar.json`**

```json
{
  "meta": {
    "title": "Agendar consulta — Clínica Sorriso",
    "description": "Agende sua avaliação odontológica na Clínica Sorriso. Atendimento de segunda a sábado, das 9h às 19h. Marque online."
  },
  "blocks": [
    { "type": "pageHeader", "props": {
      "eyebrow": "Agendar consulta",
      "title": "Marque sua avaliação em poucos passos.",
      "lead": "Escolha o serviço e envie seus dados — a gente confirma o horário.",
      "breadcrumb": [ { "label": "Início", "href": "/" }, { "label": "Agendar consulta", "href": "/agendar" } ]
    }},
    { "type": "comoFunciona", "props": { "eyebrow": "Como funciona", "title": "Três passos para o seu sorriso.", "steps": "<<COPIAR steps do bloco comoFunciona em page.json>>" }},
    { "type": "ctaContato", "props": { "eyebrow": "Agende agora", "title": "Preencha e agende sua avaliação.", "services": "<<COPIAR services do bloco ctaContato em page.json>>" }}
  ]
}
```

- [ ] **Step 6: Verificar build (gera as 5 rotas)**

Run:
```bash
cd /c/Projects/clinify && bun run build && ls dist/servicos/index.html dist/equipe/index.html dist/sobre/index.html dist/contato/index.html dist/agendar/index.html
```
Expected: os 5 arquivos existem.

- [ ] **Step 7: Checar h1 único por página**

Run:
```bash
cd /c/Projects/clinify
for p in servicos equipe sobre contato agendar; do echo -n "$p: "; grep -o "<h1" dist/$p/index.html | wc -l; done
```
Expected: cada página retorna `1` (exatamente um h1).

- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat(pages): 5 páginas únicas (servicos/equipe/sobre/contato/agendar) com meta + h1 próprios"`

---

### Task 6: Nav real — Header + Footer + CTAs da home

**Files:** Modify `src/components/layout/Header.astro`, `src/components/layout/Footer.astro`, `src/data/page.json`

- [ ] **Step 1: `src/components/layout/Header.astro`**

```astro
---
import site from '../../data/siteConfig.json';
const path = Astro.url.pathname;
const nav = [
  { label: 'Início', href: '/' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Equipe', href: '/equipe' },
  { label: 'Contato', href: '/contato' },
];
const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
---
<header class="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-border">
  <div class="container-x flex items-center justify-between h-16">
    <a href="/" class="font-display text-xl font-bold text-primary">{site.name}</a>
    <nav class="hidden md:flex items-center gap-7">
      {nav.map((n) => (
        <a
          href={n.href}
          aria-current={isActive(n.href) ? 'page' : undefined}
          class={`text-sm transition ${isActive(n.href) ? 'text-primary font-semibold' : 'text-ink-muted hover:text-primary'}`}
        >{n.label}</a>
      ))}
    </nav>
    <a href="/agendar" class="btn-accent text-sm">Agendar consulta</a>
  </div>
</header>
```

- [ ] **Step 2: `src/components/layout/Footer.astro`** — trocar os "Quick Links" por rotas reais. Localizar a coluna de links (ou adicionar uma) e usar:

```astro
<div>
  <p class="font-semibold text-white mb-3">Navegação</p>
  <ul class="space-y-2 text-sm">
    <li><a href="/sobre" class="hover:text-white transition">Sobre</a></li>
    <li><a href="/servicos" class="hover:text-white transition">Serviços</a></li>
    <li><a href="/equipe" class="hover:text-white transition">Equipe</a></li>
    <li><a href="/contato" class="hover:text-white transition">Contato</a></li>
    <li><a href="/agendar" class="hover:text-white transition">Agendar consulta</a></li>
  </ul>
</div>
```

> Manter o grid do Footer coerente (ajustar `md:grid-cols-*` se adicionar coluna). Não mexer em cores/tokens.

- [ ] **Step 3: `src/data/page.json`** — apontar os CTAs da home pras páginas dedicadas (busca-e-troca os `href`):
  - bloco `hero` → `cta.href`: `"#contato"` → `"/agendar"`
  - bloco `sobre` → `cta.href`: `"#contato"` → `"/sobre"`
  - bloco `servicos` → `cta.href`: `"#contato"` → `"/servicos"`
  - (ctaContato da home permanece com âncora — é o form no fim da home)

- [ ] **Step 4: Verificar**

Run:
```bash
cd /c/Projects/clinify && bun run build && grep -o 'href="/agendar"' dist/index.html | head -1
```
Expected: acha `href="/agendar"` (CTA da home aponta pra página).

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(nav): Header/Footer com rotas reais + estado ativo + CTAs da home"`

---

### Task 7: Teste de integridade das páginas + verificação final

**Files:** Modify `src/test/blocks.test.ts`

- [ ] **Step 1: Estender `src/test/blocks.test.ts`** — adicionar validação das 5 páginas:

```ts
import servicos from '../data/pages/servicos.json';
import equipe from '../data/pages/equipe.json';
import sobre from '../data/pages/sobre.json';
import contato from '../data/pages/contato.json';
import agendar from '../data/pages/agendar.json';

const PAGES = { servicos, equipe, sobre, contato, agendar };

describe('pages/*.json integrity', () => {
  it('toda página tem meta.title e meta.description', () => {
    for (const [name, p] of Object.entries(PAGES)) {
      expect(p.meta?.title, `${name}.title`).toBeTruthy();
      expect(p.meta?.description, `${name}.description`).toBeTruthy();
    }
  });

  it('todo block.type das páginas é conhecido', () => {
    for (const [name, p] of Object.entries(PAGES)) {
      for (const b of p.blocks) {
        expect(BLOCK_TYPES, `${name}: ${b.type}`).toContain(b.type);
      }
    }
  });

  it('toda página começa com pageHeader (h1 único)', () => {
    for (const [name, p] of Object.entries(PAGES)) {
      expect(p.blocks[0].type, `${name} deve abrir com pageHeader`).toBe('pageHeader');
    }
  });
});
```

> Mantém o `import { BLOCK_TYPES }` e o `import page from '../data/page.json'` já existentes no topo do arquivo.

- [ ] **Step 2: Rodar testes** — `cd /c/Projects/clinify && bun run test`
Expected: PASS (testes antigos + 3 novos).

- [ ] **Step 3: Verificação final de SEO**

Run:
```bash
cd /c/Projects/clinify && bun run build
echo "=== titles únicos ===" && for p in index servicos/index equipe/index sobre/index contato/index agendar/index; do grep -o "<title>[^<]*</title>" dist/$p.html; done
echo "=== canonical presente ===" && grep -c 'rel="canonical"' dist/servicos/index.html
```
Expected: 6 títulos DIFERENTES; canonical presente (1) em cada subpágina.

- [ ] **Step 4: Commit final** — `git add -A && git commit -m "test+docs: integridade das páginas + verificação SEO"`

---

## Critério de pronto

- [ ] 5 rotas estáticas geradas: `/servicos`, `/equipe`, `/sobre`, `/contato`, `/agendar` (Task 5.6)
- [ ] Cada página tem `<title>` e `<meta description>` ÚNICOS (Task 7.3)
- [ ] Cada página tem exatamente **um** `<h1>` (via `pageHeader`) (Task 5.7)
- [ ] `<link rel="canonical">` + Open Graph em todas as páginas (Task 2, 7.3)
- [ ] sitemap (`dist/sitemap-index.xml`) + `robots.txt` gerados (Task 3.4)
- [ ] Header/Footer linkam as rotas reais; nav com estado ativo (Task 6)
- [ ] CTAs da home apontam pras páginas dedicadas (Task 6.4)
- [ ] `bun run build` e `bun run test` verdes

## Coordenação (ponto de atenção com Jurandir / Estágio 2)

Este refactor toca `astro.config.mjs`, `BaseLayout.astro` e `package.json` — que o
Jurandir também vai tocar no Estágio 2 (adapter Vercel/SSR, plugin de SEO).
**Recomendação do Genilson: este refactor SEO entra ANTES do grosso do Estágio 2.**
É pequeno e foundational; rebasear o Jurandir em cima dele é trivial. O contrário
gera conflito. Avisar o Jurandir que `[slug].astro` (raiz) é página de clínica e o
blog dele vai pra `/blog/[slug]`.
</content>
