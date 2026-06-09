# Clinify — Blog institucional (Content Collection) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps usam checkbox (`- [ ]`).

**Goal:** Pôr o blog pra funcionar de forma institucional — `/blog` (listagem) + `/blog/[slug]` (artigo), 3 posts seed, SEO por post (canonical/OG/JSON-LD Article), e o bloco `novidades` da home puxando os 3 últimos posts reais.

**Architecture:** Astro Content Collections v5 (Content Layer API). Posts em Markdown em `src/content/blog/*.md`, validados por schema Zod em `src/content.config.ts`. Páginas estáticas geradas no build via `getCollection`/`render`. FE puro, standalone — **forward-compatible com o CMS** (Estágio 2: o `PostEditor` do scaffold edita exatamente esses `.md`). Capas reusam `/images/post-{1,2,3}.jpg` (já baixadas da Pexels).

**Tech Stack:** Astro 5.1 Content Collections (`glob` loader, `render`), Tailwind 3, Bun.

**Base:** Estágio 1 + páginas únicas SEO já entregues. API v5 confirmada via docs oficiais.

---

## File Structure (delta)

```
NOVO:
  src/content.config.ts                ← define a coleção blog (glob + schema Zod)
  src/content/blog/consulta-regular.md
  src/content/blog/clareamento-dental.md
  src/content/blog/implantes-dentarios.md
  src/lib/posts.ts                     ← helper getPublishedPosts()
  src/pages/blog/index.astro           ← listagem institucional
  src/pages/blog/[slug].astro          ← artigo + JSON-LD Article
MODIFICA:
  src/styles/global.css                ← + .prose-clinic (corpo do artigo, token-aware)
  src/blocks/Novidades.astro           ← puxa da coleção (fallback p/ props.items)
  src/components/layout/Header.astro    ← + link "Novidades" → /blog
  src/components/layout/Footer.astro    ← + link Novidades na navegação
```

**Regras herdadas:** zero hex em componente (só tokens); `<h1>` único por página; SEO via BaseLayout (canonical/OG já existem).

---

### Task 1: Coleção + posts seed

**Files:** Create `src/content.config.ts`, `src/content/blog/{consulta-regular,clareamento-dental,implantes-dentarios}.md`

- [ ] **Step 1: `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string().default('Novidades'),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

- [ ] **Step 2: `src/content/blog/consulta-regular.md`**

```md
---
title: "A importância da consulta odontológica regular"
description: "Visitar o dentista a cada seis meses previne problemas e mantém seu sorriso saudável. Entenda por que a rotina faz diferença."
pubDate: 2026-05-28
category: "Prevenção"
heroImage: "/images/post-1.jpg"
---

Manter uma rotina de visitas ao dentista é o jeito mais simples de cuidar da saúde bucal. A maioria dos problemas, como cáries e gengivite, começa de forma silenciosa e só dá sinais quando já está avançada. A consulta regular permite identificar tudo cedo, quando o tratamento é mais simples e confortável.

## Por que a cada seis meses?

Esse intervalo é o recomendado para a maioria das pessoas porque dá tempo de acompanhar mudanças sem deixar nada passar. Em alguns casos, com histórico de problemas ou tratamentos em andamento, o dentista pode sugerir visitas mais próximas.

## O que é avaliado na consulta

Além da limpeza profissional, o profissional avalia gengivas, possíveis cáries, desgaste dos dentes e a saúde geral da boca. É também o momento de tirar dúvidas e ajustar a rotina de cuidados em casa.

Agende sua avaliação e mantenha seu sorriso em dia.
```

- [ ] **Step 3: `src/content/blog/clareamento-dental.md`**

```md
---
title: "5 benefícios do clareamento dental profissional"
description: "O clareamento feito em clínica é mais seguro e eficaz que as opções caseiras. Veja as principais vantagens."
pubDate: 2026-05-22
category: "Estética"
heroImage: "/images/post-2.jpg"
---

Um sorriso mais branco aumenta a confiança e renova a aparência. O clareamento profissional, feito com acompanhamento, entrega resultado previsível e respeita a saúde dos dentes.

## 1. Resultado mais rápido e uniforme

Com produtos de uso profissional e protocolo adequado, o clareamento alcança tons mais claros de forma homogênea, sem manchas.

## 2. Segurança para o esmalte e a gengiva

O acompanhamento do dentista protege os tecidos e reduz a sensibilidade, algo difícil de controlar com kits caseiros.

## 3. Durabilidade

Com os cuidados certos, o resultado se mantém por muito mais tempo. O profissional orienta como prolongar o efeito.

Quer saber se o clareamento é indicado para você? Agende uma avaliação.
```

- [ ] **Step 4: `src/content/blog/implantes-dentarios.md`**

```md
---
title: "Implantes dentários: o que você precisa saber"
description: "Os implantes devolvem função e estética com naturalidade. Entenda como funcionam e quando são indicados."
pubDate: 2026-05-15
category: "Tratamentos"
heroImage: "/images/post-3.jpg"
---

O implante dentário é uma das formas mais modernas de repor um dente perdido. Ele substitui a raiz por um pino de titânio, sobre o qual é fixada uma coroa com aparência natural.

## Quando o implante é indicado

Para quem perdeu um ou mais dentes e busca uma solução fixa, confortável e duradoura. Cada caso é avaliado individualmente, considerando a saúde óssea e gengival.

## Como é o processo

Após a avaliação e o planejamento, o implante é instalado e passa por um período de integração com o osso. Em seguida, a coroa definitiva é colocada, devolvendo o sorriso e a mastigação.

Marque uma avaliação para descobrir a melhor opção para o seu caso.
```

- [ ] **Step 5: Verificar schema (build valida frontmatter)**

Run: `cd /c/Projects/clinify && bun run build`
Expected: PASS — se algum frontmatter faltar campo obrigatório, o build acusa.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat(blog): coleção content + 3 posts seed institucionais"`

---

### Task 2: Estilo do corpo do artigo (`.prose-clinic`)

**Files:** Modify `src/styles/global.css`

- [ ] **Step 1: Adicionar ao bloco `@layer components` do `src/styles/global.css`**

```css
  .prose-clinic { @apply text-ink-muted leading-relaxed text-lg; }
  .prose-clinic h2 { @apply text-ink text-2xl font-display font-semibold mt-10 mb-3; }
  .prose-clinic h3 { @apply text-ink text-xl font-display font-semibold mt-8 mb-2; }
  .prose-clinic p { @apply my-4; }
  .prose-clinic ul { @apply my-4 pl-5 list-disc space-y-1; }
  .prose-clinic ol { @apply my-4 pl-5 list-decimal space-y-1; }
  .prose-clinic a { @apply text-primary underline underline-offset-2 hover:text-secondary; }
  .prose-clinic blockquote { @apply border-l-4 border-accent pl-4 italic my-6 text-ink; }
  .prose-clinic strong { @apply text-ink font-semibold; }
```

- [ ] **Step 2: Verificar** — `bun run build` → PASS.
- [ ] **Step 3: Commit** — `git commit -am "feat(blog): estilo .prose-clinic token-aware p/ corpo do artigo"`

---

### Task 3: Helper de posts

**Files:** Create `src/lib/posts.ts`

- [ ] **Step 1: `src/lib/posts.ts`**

```ts
import { getCollection } from 'astro:content';

/** Posts publicados (não-draft), ordenados do mais recente pro mais antigo. */
export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
```

- [ ] **Step 2: Commit** — `git add -A && git commit -m "feat(blog): helper getPublishedPosts"`

---

### Task 4: Listagem `/blog`

**Files:** Create `src/pages/blog/index.astro`

- [ ] **Step 1: `src/pages/blog/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getPublishedPosts } from '../../lib/posts';
const posts = await getPublishedPosts();
const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
---
<BaseLayout title="Novidades — Clínica Sorriso" description="Artigos e dicas de saúde bucal da Clínica Sorriso para você cuidar melhor do seu sorriso.">
  <section class="bg-soft">
    <div class="container-x py-12 md:py-16">
      <nav aria-label="Trilha" class="mb-4">
        <ol class="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <li><a href="/" class="hover:text-primary transition">Início</a></li>
          <li aria-hidden="true">/</li>
          <li class="text-ink" aria-current="page">Novidades</li>
        </ol>
      </nav>
      <span class="eyebrow">Novidades</span>
      <h1 class="text-4xl md:text-5xl">Artigos e dicas para o seu sorriso.</h1>
    </div>
  </section>
  <section class="section">
    <div class="container-x">
      {posts.length === 0 ? (
        <p class="text-ink-muted">Em breve, novos artigos.</p>
      ) : (
        <div class="grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <a href={`/blog/${p.id}`} class="card overflow-hidden group">
              <div class="aspect-[16/10] bg-soft overflow-hidden">
                {p.data.heroImage && <img src={p.data.heroImage} alt={p.data.title} class="w-full h-full object-cover group-hover:scale-105 transition" />}
              </div>
              <div class="p-6">
                <span class="text-xs font-semibold text-accent uppercase tracking-wide">{p.data.category}</span>
                <h2 class="mt-2 text-lg group-hover:text-primary transition">{p.data.title}</h2>
                <p class="mt-2 text-sm text-ink-muted line-clamp-3">{p.data.description}</p>
                <span class="mt-3 block text-xs text-ink-muted">{fmt(p.data.pubDate)}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Verificar** — `bun run build && ls dist/blog/index.html` → existe.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(blog): página de listagem /blog"`

---

### Task 5: Artigo `/blog/[slug]` + JSON-LD

**Files:** Create `src/pages/blog/[slug].astro`

- [ ] **Step 1: `src/pages/blog/[slug].astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';
import site from '../../data/siteConfig.json';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
const canonical = Astro.site ? new URL(Astro.url.pathname, Astro.site).href : Astro.url.pathname;
const imageAbs = post.data.heroImage
  ? (Astro.site ? new URL(post.data.heroImage, Astro.site).href : post.data.heroImage)
  : undefined;
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.data.title,
  description: post.data.description,
  datePublished: post.data.pubDate.toISOString(),
  ...(imageAbs ? { image: imageAbs } : {}),
  author: { '@type': 'Organization', name: site.name },
  publisher: { '@type': 'Organization', name: site.name },
  mainEntityOfPage: canonical,
};
---
<BaseLayout title={`${post.data.title} — ${site.name}`} description={post.data.description} ogType="article">
  <article>
    <header class="bg-soft">
      <div class="container-x max-w-3xl py-12 md:py-16">
        <nav aria-label="Trilha" class="mb-4">
          <ol class="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <li><a href="/" class="hover:text-primary transition">Início</a></li>
            <li aria-hidden="true">/</li>
            <li><a href="/blog" class="hover:text-primary transition">Novidades</a></li>
            <li aria-hidden="true">/</li>
            <li class="text-ink" aria-current="page">{post.data.category}</li>
          </ol>
        </nav>
        <span class="eyebrow">{post.data.category}</span>
        <h1 class="text-3xl md:text-4xl">{post.data.title}</h1>
        <p class="mt-3 text-sm text-ink-muted">{fmt(post.data.pubDate)}</p>
      </div>
    </header>
    {post.data.heroImage && (
      <div class="container-x max-w-3xl">
        <img src={post.data.heroImage} alt={post.data.title} class="w-full rounded-2xl border border-border -mt-6" />
      </div>
    )}
    <div class="container-x max-w-3xl section">
      <div class="prose-clinic">
        <Content />
      </div>
      <div class="mt-12 pt-8 border-t border-border flex flex-wrap gap-3">
        <a href="/agendar" class="btn-accent">Agendar avaliação</a>
        <a href="/blog" class="btn-ghost">Ver mais artigos</a>
      </div>
    </div>
  </article>
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
</BaseLayout>
```

- [ ] **Step 2: Verificar (rotas + JSON-LD)**

Run:
```bash
cd /c/Projects/clinify && bun run build
ls dist/blog/consulta-regular/index.html
grep -c 'application/ld+json' dist/blog/consulta-regular/index.html
grep -o '"@type":"Article"' dist/blog/consulta-regular/index.html
```
Expected: arquivo existe; `1` script ld+json; acha `"@type":"Article"`.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(blog): página de artigo /blog/[slug] + JSON-LD Article"`

---

### Task 6: Wire do bloco `novidades` na coleção

**Files:** Modify `src/blocks/Novidades.astro`

> O bloco passa a puxar os 3 últimos posts reais. Mantém `props.items` como **fallback** (home não quebra se não houver post). Adiciona link "Ver todas".

- [ ] **Step 1: Reescrever `src/blocks/Novidades.astro`**

```astro
---
import { getCollection } from 'astro:content';
interface Item { title: string; excerpt: string; image?: string; href: string; }
interface Props { eyebrow?: string; title: string; items?: Item[]; }
const { eyebrow, title, items = [] } = Astro.props;

let fromCollection: Item[] = [];
try {
  const all = await getCollection('blog', ({ data }) => !data.draft);
  fromCollection = all
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .slice(0, 3)
    .map((p) => ({
      title: p.data.title,
      excerpt: p.data.description,
      image: p.data.heroImage,
      href: `/blog/${p.id}`,
    }));
} catch { /* coleção ainda não disponível */ }

const cards = fromCollection.length > 0 ? fromCollection : items;
---
<section class="section bg-soft">
  <div class="container-x">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-10">
      <div class="max-w-2xl">
        {eyebrow && <span class="eyebrow">{eyebrow}</span>}
        <h2 class="text-3xl md:text-4xl">{title}</h2>
      </div>
      <a href="/blog" class="text-sm font-medium text-accent">Ver todas →</a>
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      {cards.map((p) => (
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

- [ ] **Step 2: Verificar (home aponta pros posts reais)**

Run:
```bash
cd /c/Projects/clinify && bun run build && grep -o 'href="/blog/consulta-regular"' dist/index.html | head -1
```
Expected: acha o link → a home está puxando da coleção.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(blog): bloco novidades puxa os 3 últimos posts (fallback p/ mock)"`

---

### Task 7: Nav — "Novidades" no Header e Footer + verificação final

**Files:** Modify `src/components/layout/Header.astro`, `src/components/layout/Footer.astro`

- [ ] **Step 1: `Header.astro`** — adicionar `{ label: 'Novidades', href: '/blog' }` ao array `nav`, entre 'Equipe' e 'Contato':

```ts
const nav = [
  { label: 'Início', href: '/' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Serviços', href: '/servicos' },
  { label: 'Equipe', href: '/equipe' },
  { label: 'Novidades', href: '/blog' },
  { label: 'Contato', href: '/contato' },
];
```
> `isActive('/blog')` usa `path.startsWith('/blog')` → fica ativo também nos artigos. Já funciona com a função existente.

- [ ] **Step 2: `Footer.astro`** — adicionar na lista "Navegação": `<li><a href="/blog" class="hover:text-white transition">Novidades</a></li>` (após Equipe).

- [ ] **Step 3: Verificação final**

Run:
```bash
cd /c/Projects/clinify && bun run build && bun run test
echo "=== rotas blog ===" && ls dist/blog/index.html dist/blog/consulta-regular/index.html dist/blog/clareamento-dental/index.html dist/blog/implantes-dentarios/index.html
echo "=== nav tem Novidades ===" && grep -o 'href="/blog"' dist/index.html | head -1
echo "=== title do artigo ===" && grep -o "<title>[^<]*</title>" dist/blog/consulta-regular/index.html
```
Expected: build+test verdes; 4 arquivos de blog existem; nav tem `/blog`; title do artigo é único ("A importância... — Clínica Sorriso").

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(nav): link Novidades no Header e Footer"`

---

## Critério de pronto

- [ ] `/blog` lista os 3 posts (cards com capa, categoria, data, resumo)
- [ ] `/blog/<slug>` renderiza o artigo com `.prose-clinic`, breadcrumb e CTA
- [ ] Cada artigo tem `<title>`/`description` únicos, canonical, OG `article` e **JSON-LD Article**
- [ ] Bloco `novidades` da home mostra os 3 últimos posts reais (link pro artigo)
- [ ] "Novidades" no Header (estado ativo) e Footer
- [ ] `bun run build` e `bun run test` verdes; schema valida os 3 posts

## Forward-compat (Estágio 2 — Jurandir)

O blog usa `src/content/blog/*.md`. Quando o Jurandir embarcar o admin do scaffold,
o `PostEditor` edita esses mesmos arquivos (persistidos via `repoAtomicCommit`).
**Nada aqui precisa ser refeito** — o Estágio 2 só pluga o admin por cima. O
`[slug].astro` do blog vive sob `/blog/`, sem colisão com o `[slug].astro` de
páginas de clínica (raiz).
</content>
