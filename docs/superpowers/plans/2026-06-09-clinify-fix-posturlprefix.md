# Clinify — Fix: ligar o blog ao `postUrlPrefix` (prefixo /blog) Plan

> Use superpowers:executing-plans. Branch: `cms-scaffold-completo`.

**Bug (root cause):** O config `siteConfig.postUrlPrefix` ('' = limpo, 'blog' = /blog) é editável no ConfigEditor e o `src/lib/postUrl.ts` o respeita (`BLOG_BASE`). MAS o blog do clinify (content-collection do Estágio 1) **hardcoda `/blog/`** na rota (`src/pages/blog/[slug].astro`) e nos links (Header/Footer/Novidades/listagem), **sem nunca ler o `postUrlPrefix`**. Logo o setting não tem efeito.

**Decisão (Bruno):** o setting controla o **prefixo da URL dos posts** (posts `/slug` vs `/blog/slug`). O blog continua existindo (listagem `/blog`, nav "Novidades", bloco Novidades) — só a URL dos POSTS muda.

**Fix:** rotear os posts via `BLOG_BASE` e usar `postUrl()` em todos os links de post. Listagem permanece em `/blog`.

**Guard-rail:** NÃO mexer no visual (global.css/theme/themes/tailwind/blocos exceto links). `bun run build` verde + `bun run test` 8/8.

---

### Task 1: Componente de post compartilhado

**Files:** Create `src/components/PostArticle.astro`

- [ ] Extrair TODO o render do post (header/breadcrumb, hero image, prose, JSON-LD Article, CTA) do atual `src/pages/blog/[slug].astro` pra um componente que recebe `post` como prop e roda `render(post)` dentro. O breadcrumb "Novidades" continua linkando `/blog` (a listagem). Conteúdo idêntico ao atual, só parametrizado por `post`.

```astro
---
import { render } from 'astro:content';
import site from '../data/siteConfig.json';
interface Props { post: any; }
const { post } = Astro.props;
const { Content } = await render(post);
const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
const canonical = Astro.site ? new URL(Astro.url.pathname, Astro.site).href : Astro.url.pathname;
const imageAbs = post.data.heroImage ? (Astro.site ? new URL(post.data.heroImage, Astro.site).href : post.data.heroImage) : undefined;
const jsonLd = {
  '@context': 'https://schema.org', '@type': 'Article',
  headline: post.data.title, description: post.data.description,
  datePublished: post.data.pubDate.toISOString(),
  ...(imageAbs ? { image: imageAbs } : {}),
  author: { '@type': 'Organization', name: site.name },
  publisher: { '@type': 'Organization', name: site.name },
  mainEntityOfPage: canonical,
};
---
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
    <div class="prose-clinic"><Content /></div>
    <div class="mt-12 pt-8 border-t border-border flex flex-wrap gap-3">
      <a href="/agendar" class="btn-accent">Agendar avaliação</a>
      <a href="/blog" class="btn-ghost">Ver mais artigos</a>
    </div>
  </div>
</article>
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

---

### Task 2: Rota `/blog/{slug}` — só quando prefixo = 'blog'

**Files:** Modify `src/pages/blog/[slug].astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostArticle from '../../components/PostArticle.astro';
import { getCollection } from 'astro:content';
import { BLOG_BASE } from '../../lib/postUrl';
import site from '../../data/siteConfig.json';

export async function getStaticPaths() {
  if (BLOG_BASE !== '/blog') return []; // só gera quando o prefixo é 'blog'
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}
const { post } = Astro.props;
---
<BaseLayout title={`${post.data.title} — ${site.name}`} description={post.data.description} ogType="article">
  <PostArticle post={post} />
</BaseLayout>
```

---

### Task 3: Rota root `/{slug}` — posts quando prefixo = '' (+ páginas fixas)

**Files:** Modify `src/pages/[slug].astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BlockRenderer from '../blocks/BlockRenderer.astro';
import PostArticle from '../components/PostArticle.astro';
import { getCollection } from 'astro:content';
import { BLOG_BASE } from '../lib/postUrl';
import site from '../data/siteConfig.json';
import type { Block } from '../blocks/types';

export async function getStaticPaths() {
  const pageMods: Record<string, any> = import.meta.glob('../data/pages/*.json', { eager: true });
  const pages = Object.entries(pageMods).map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace('.json', '');
    return { params: { slug }, props: { kind: 'page', page: mod.default ?? mod } };
  });
  let posts: any[] = [];
  if (BLOG_BASE === '') {
    const all = await getCollection('blog', ({ data }) => !data.draft);
    posts = all.map((post) => ({ params: { slug: post.id }, props: { kind: 'post', post } }));
  }
  return [...pages, ...posts];
}
const props = Astro.props as any;
---
{props.kind === 'post' ? (
  <BaseLayout title={`${props.post.data.title} — ${site.name}`} description={props.post.data.description} ogType="article">
    <PostArticle post={props.post} />
  </BaseLayout>
) : (
  <BaseLayout title={props.page.meta.title} description={props.page.meta.description}>
    <BlockRenderer blocks={props.page.blocks as Block[]} />
  </BaseLayout>
)}
```

> **Atenção colisão:** com prefixo '', um slug de post não pode ser igual a um slug de página fixa (servicos/equipe/sobre/contato/agendar). Os atuais não colidem. Se colidir, o build acusa "duplicate route".

---

### Task 4: Links de post via `postUrl()` + campo no siteConfig

**Files:** Modify `src/pages/blog/index.astro`, `src/blocks/Novidades.astro`, `src/data/siteConfig.json`

- [ ] `src/pages/blog/index.astro` — importar `postUrl` de `../../lib/postUrl` e trocar `href={`/blog/${p.id}`}` por `href={postUrl(p.id)}`.
- [ ] `src/blocks/Novidades.astro` — importar `postUrl` de `../lib/postUrl` e trocar o `href: `/blog/${p.id}`` por `href: postUrl(p.id)`. (O link "Ver todas" continua `/blog` — a listagem.)
- [ ] `src/data/siteConfig.json` — adicionar `"postUrlPrefix": ""` (default limpo) pra o campo existir explicitamente.

> Nav "Novidades" (Header/Footer) e "Ver todas" continuam `/blog` (a listagem) — não muda.

---

### Task 5: Verificação (liga/desliga o prefixo) + commit

- [ ] `bun run build` verde; `bun run test` 8/8.
- [ ] **Default ('' = sem /blog):** post no ROOT — `dist/client/implantes-dentarios/index.html` existe; `dist/client/blog/implantes-dentarios` NÃO existe. Listagem `/blog` linka `/implantes-dentarios` (Grep tool por `href="/implantes-dentarios"` em `dist/client/blog/index.html`).
- [ ] **Flip pra 'blog':** `node -e` setar `siteConfig.postUrlPrefix='blog'` → `bun run build` → `dist/client/blog/implantes-dentarios/index.html` existe e root `dist/client/implantes-dentarios` NÃO. Listagem linka `/blog/implantes-dentarios`. **Reverter pra ''** no fim (`git checkout src/data/siteConfig.json`).
- [ ] Listagem `/blog` e nav "Novidades" continuam funcionando nos dois modos.
- [ ] Commit: `git add -A && git commit -m "fix(blog): respeitar siteConfig.postUrlPrefix (posts /slug vs /blog/slug)"`

## Critério de pronto
- [ ] postUrlPrefix='' → posts em `/{slug}` (sem /blog); ='blog' → `/blog/{slug}`
- [ ] Listagem `/blog` + nav "Novidades" intactas; links de post seguem o prefixo
- [ ] Build verde, test 8/8, visual intocado

## Follow-up (fora deste fix)
301 automático no `vercel.json` ao trocar o prefixo (o ConfigEditor promete isso). Importante quando o site estiver no ar e o prefixo mudar. Não bloqueia agora (site não publicado).
</content>
