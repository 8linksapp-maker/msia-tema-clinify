# Clinify — Mapa do site no admin (todas as páginas + URLs) Plan

> Use superpowers:executing-plans. Branch: `cms-scaffold-completo`.

**Goal:** Uma página no `/admin` que lista TODAS as páginas geradas (matriz serviço×localidade + páginas fixas + blog) com suas URLs clicáveis, pra revisar conteúdo e analisar. Read-only, server-rendered (igual ao painel de leads). Atualiza sozinha conforme serviços/localidades mudam (lê os dados em runtime).

**Guard-rail:** NÃO tocar frontend/tema/blocos. Só CRIAR `src/pages/admin/paginas.astro` e adicionar 1 link no `AdminNav.tsx`. `bun run build` verde + `bun run test` 8/8.

---

### Task 1: Página `/admin/paginas`

**Files:** Create `src/pages/admin/paginas.astro`

```astro
---
export const prerender = false;
import AdminLayout from '../../layouts/AdminLayout.astro';
import servicos from '../../data/servicos.json';
import locais from '../../data/locais.json';
import { getCollection } from 'astro:content';

// Matriz serviço × localidade
const matriz: { servico: string; localidade: string; url: string }[] = [];
for (const s of servicos as any[]) {
  for (const l of locais as any[]) {
    matriz.push({ servico: s.nome, localidade: l.nome, url: `/${s.slug}-${l.prep || 'em'}-${l.slug}` });
  }
}

// Páginas fixas
const fixas = [
  { label: 'Home', url: '/' },
  { label: 'Serviços', url: '/servicos' },
  { label: 'Equipe', url: '/equipe' },
  { label: 'Sobre', url: '/sobre' },
  { label: 'Contato', url: '/contato' },
  { label: 'Agendar consulta', url: '/agendar' },
  { label: 'Novidades (blog)', url: '/blog' },
];

// Blog
let posts: { label: string; url: string }[] = [];
try {
  posts = (await getCollection('blog'))
    .filter((p: any) => !p.data.draft)
    .map((p: any) => ({ label: p.data.title, url: `/blog/${p.id}` }));
} catch {}

const total = matriz.length + fixas.length + posts.length;
---
<AdminLayout title="Páginas do site" activeSection="paginas">
  <div class="flex items-end justify-between gap-4 mb-2">
    <div>
      <h1 class="text-2xl font-bold text-adm-ink">Páginas do site</h1>
      <p class="text-adm-ink-muted text-sm">{total} páginas no total · {matriz.length} da matriz · {fixas.length} fixas · {posts.length} no blog</p>
    </div>
    <input id="busca" type="search" placeholder="Filtrar por serviço, localidade ou URL…" class="w-72 px-4 py-2 rounded-lg border border-adm-border bg-adm-surface text-adm-ink text-sm" />
  </div>

  <!-- Matriz -->
  <h2 class="text-lg font-semibold text-adm-ink mt-8 mb-3">SEO Local — matriz serviço × localidade ({matriz.length})</h2>
  <div class="bg-adm-surface border border-adm-border rounded-xl overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-adm-bg text-adm-ink-muted">
        <tr><th class="text-left px-4 py-2 font-semibold">Serviço</th><th class="text-left px-4 py-2 font-semibold">Localidade</th><th class="text-left px-4 py-2 font-semibold">URL</th><th class="px-4 py-2"></th></tr>
      </thead>
      <tbody>
        {matriz.map((m) => (
          <tr class="border-t border-adm-border js-row" data-search={`${m.servico} ${m.localidade} ${m.url}`.toLowerCase()}>
            <td class="px-4 py-2 text-adm-ink">{m.servico}</td>
            <td class="px-4 py-2 text-adm-ink-muted">{m.localidade}</td>
            <td class="px-4 py-2"><code class="text-adm-primary">{m.url}</code></td>
            <td class="px-4 py-2 text-right"><a href={m.url} target="_blank" rel="noopener" class="text-adm-primary underline">abrir ↗</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <!-- Fixas -->
  <h2 class="text-lg font-semibold text-adm-ink mt-8 mb-3">Páginas fixas</h2>
  <div class="bg-adm-surface border border-adm-border rounded-xl overflow-hidden">
    <table class="w-full text-sm">
      <tbody>
        {fixas.map((f) => (
          <tr class="border-t border-adm-border first:border-t-0 js-row" data-search={`${f.label} ${f.url}`.toLowerCase()}>
            <td class="px-4 py-2 text-adm-ink">{f.label}</td>
            <td class="px-4 py-2"><code class="text-adm-primary">{f.url}</code></td>
            <td class="px-4 py-2 text-right"><a href={f.url} target="_blank" rel="noopener" class="text-adm-primary underline">abrir ↗</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <!-- Blog -->
  <h2 class="text-lg font-semibold text-adm-ink mt-8 mb-3">Blog ({posts.length})</h2>
  <div class="bg-adm-surface border border-adm-border rounded-xl overflow-hidden">
    {posts.length === 0 ? (
      <p class="px-4 py-3 text-adm-ink-muted text-sm">Nenhum post.</p>
    ) : (
      <table class="w-full text-sm">
        <tbody>
          {posts.map((p) => (
            <tr class="border-t border-adm-border first:border-t-0 js-row" data-search={`${p.label} ${p.url}`.toLowerCase()}>
              <td class="px-4 py-2 text-adm-ink">{p.label}</td>
              <td class="px-4 py-2"><code class="text-adm-primary">{p.url}</code></td>
              <td class="px-4 py-2 text-right"><a href={p.url} target="_blank" rel="noopener" class="text-adm-primary underline">abrir ↗</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>

  <script is:inline>
    const inp = document.getElementById('busca');
    inp && inp.addEventListener('input', () => {
      const q = inp.value.trim().toLowerCase();
      document.querySelectorAll('.js-row').forEach((r) => {
        r.style.display = !q || (r.getAttribute('data-search') || '').includes(q) ? '' : 'none';
      });
    });
  </script>
</AdminLayout>
```

- [ ] **Verificar** — `bun run build` → PASS.

---

### Task 2: Link no AdminNav

**Files:** Modify `src/components/admin/AdminNav.tsx`

- [ ] Adicionar um link **"Páginas do site"** → `/admin/paginas` (key de seção `paginas`), no padrão dos itens existentes — perto do topo (ex: logo após "Leads"/"Início", ou no início da seção "Conteúdo do site"). Ícone do lucide (ex: `ListTree` ou `FileText`). NÃO reescrever o componente.

- [ ] **Verificar** — `bun run build` → PASS.

---

### Task 3: Verificação + commit

- [ ] `bun run build` verde; `bun run test` 8/8.
- [ ] dev + login (123456) → `/admin/paginas` retorna 200 e lista as URLs da matriz (Grep tool por `implante-dentario-em-pinheiros` no HTML servido).
- [ ] Guard-rail: git diff só `paginas.astro` (novo) + `AdminNav.tsx`.
- [ ] Commit: `git add src/pages/admin/paginas.astro src/components/admin/AdminNav.tsx && git commit -m "feat(cms): mapa do site no admin (todas as páginas + URLs)"`

## Critério de pronto
- [ ] `/admin/paginas` lista matriz + fixas + blog, com URLs clicáveis (abrir em nova aba) e busca/filtro
- [ ] Contadores corretos; atualiza conforme serviços/localidades (lê dados em runtime)
- [ ] Build verde, test 8/8, frontend intocado, link no menu
</content>
