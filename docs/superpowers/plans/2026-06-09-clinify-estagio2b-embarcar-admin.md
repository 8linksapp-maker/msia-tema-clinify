# Clinify — Estágio 2B (Fase 1): Embarcar a casca do CMS + 1 editor de prova

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps usam checkbox (`- [ ]`).

**Goal:** Embarcar a aplicação de admin REAL do `msia-scaffold` dentro do clinify (AdminLayout + nav + toaster + plumbing de save), SEM tocar no site da clínica (frontend do Francis), e provar o fluxo de edição com 1 editor ponta-a-ponta (Dados da clínica → edita `siteConfig.json`).

**Architecture:** Porte da camada admin do scaffold. Padrão de edição: editor React → `githubApi('read'/'write', path)` (`src/lib/adminApi.ts`) → `POST /api/admin/github` (`src/pages/api/admin/github.ts`) → persiste (dev: filesystem; prod: GitHub Contents API). O admin é **auto-contido em utilitários core do Tailwind** (stone/teal/amber) — as classes de cor custom dos componentes portados são reskinadas pra core, isolando 100% do tema da clínica. Admin = rotas `/admin/*` (prerender=false); o site da clínica continua intocado.

**Tech Stack:** + `@astrojs/react`, `react`, `react-dom`, `lucide-react`. Persistência via `github.ts` (zero deps).

**Fonte do porte:** `C:\Projects\msia-scaffold`. **Mapa de referência:** o agente de mapeamento já identificou os arquivos exatos (ver seções abaixo).

**Guard-rail inquebrável:** NÃO tocar no frontend da clínica — `src/pages/index.astro`, `src/pages/[slug].astro`, `src/pages/blog/*`, `src/blocks/*`, `src/components/layout/*`, `src/components/ThemeStyle.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `src/lib/theme.ts`, `src/data/{page,theme,siteConfig}.json` (conteúdo), `src/data/themes/*`, `src/content*`, `tailwind.config.mjs` (tokens da clínica), `src/content.config.ts`.

---

## Escopo desta fase

✅ Casca do CMS embarcada e funcional (login → shell com sidebar → leads dentro do shell).
✅ Save plumbing genérico (`github.ts` + `adminApi.ts`).
✅ 1 editor de prova: Dados da clínica (`siteConfig.json`).
🔜 **Próxima fase (fora daqui):** editores de composição de página (`page.json`), tema (`theme.json`), e por-seção (serviços/equipe/etc.).

---

## Reskin map (custom token → core Tailwind) — aplicar em TODO componente admin portado

Ao portar cada `.tsx`/`.astro` de admin do scaffold, substitua as classes de cor custom por estas (find-replace por arquivo):

| Custom (scaffold) | Core (clinify admin) |
|---|---|
| `bg-bg` | `bg-stone-50` |
| `bg-surface` | `bg-white` |
| `bg-elev` | `bg-stone-100` |
| `border-border` | `border-stone-200` |
| `text-ink` | `text-stone-900` |
| `text-ink-muted` | `text-stone-600` |
| `text-ink-faint` | `text-stone-400` |
| `bg-primary` | `bg-teal-800` |
| `text-primary` | `text-teal-800` |
| `bg-primary-soft` | `bg-teal-50` |
| `text-primary-soft` | `text-teal-200` |
| `hover:bg-primary` | `hover:bg-teal-800` |

> Regra: nenhum componente admin pode depender de token custom do clinify (`accent`, `soft`, `secondary`, etc.) nem dos do scaffold. Só core utilities. Se aparecer outra classe custom não listada, mapeie pro core equivalente neutro (stone/teal).

---

### Task 1: Deps React + integração

**Files:** Modify `package.json`, `astro.config.mjs`

- [ ] **Step 1: Instalar** — `cd /c/Projects/clinify && bun add @astrojs/react react react-dom lucide-react && bun add -d @types/react @types/react-dom`

- [ ] **Step 2: `astro.config.mjs`** — adicionar `react()` (manter o resto)

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://clinicasorriso.com.br',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), tailwind({ applyBaseStyles: false }), sitemap()],
});
```

- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "chore(cms): integração react + lucide (base do admin embarcado)"`

---

### Task 2: Save plumbing (porte do scaffold)

**Files:** Create `src/lib/adminApi.ts`, `src/pages/api/admin/github.ts`

- [ ] **Step 1: Portar `adminApi.ts` VERBATIM**

Copie `C:\Projects\msia-scaffold\src\lib\adminApi.ts` → `src/lib/adminApi.ts`. Confirme que exporta `githubApi(action, path, extra?)` e que bate em `POST /api/admin/github`.

- [ ] **Step 2: Portar `github.ts` VERBATIM**

Copie `C:\Projects\msia-scaffold\src\pages\api\admin\github.ts` → `src/pages/api/admin/github.ts`. Confirme `export const prerender = false`, as ações `read|write|list|delete`, o `handleDev()` (filesystem sem `GITHUB_*`) e o caminho GitHub Contents API. Ajuste imports relativos se a profundidade divergir. NÃO importa nada do frontend da clínica.

- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(cms): plumbing de save (adminApi + endpoint github)"`

---

### Task 3: Toaster + estilos do admin (porte + reskin)

**Files:** Create `src/components/admin/CmsToaster.tsx`, `src/styles/admin.css`

- [ ] **Step 1: Portar `CmsToaster.tsx`** de `C:\Projects\msia-scaffold\src\components\admin\CmsToaster.tsx` → `src/components/admin/CmsToaster.tsx`. Aplicar o **reskin map**. Confirme que exporta `triggerToast` (ou o nome real — anote-o; os editores vão usar).

- [ ] **Step 2: Portar `admin.css`** de `C:\Projects\msia-scaffold\src\styles\admin.css` → `src/styles/admin.css`. Esse CSS é auto-contido (define seu próprio `:root` + classes de componente) e SÓ será importado pela AdminLayout → não vaza pro site da clínica. Trazer como está.

- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(cms): CmsToaster + admin.css (reskin core)"`

---

### Task 4: AdminLayout + AdminNav (porte enxuto + nav de clínica)

**Files:** Create `src/layouts/AdminLayout.astro`, `src/components/admin/AdminNav.tsx`

- [ ] **Step 1: `src/layouts/AdminLayout.astro`** — versão enxuta (SEM o bloco `<style is:global>` do Quill, SEM DeployManager)

```astro
---
export const prerender = false;
import AdminNav from '../components/admin/AdminNav';
import CmsToaster from '../components/admin/CmsToaster';
import '../styles/admin.css';
interface Props { title?: string; activeSection?: string; }
const { title = 'Painel', activeSection = '' } = Astro.props;
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} — Painel</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-stone-50 min-h-screen" style="font-family:'Poppins',system-ui,sans-serif">
    <div class="flex min-h-screen">
      <AdminNav client:load activeSection={activeSection} />
      <main id="main-content" class="flex-1 min-w-0 ml-64" tabindex="-1">
        <div class="p-8">
          <slot />
        </div>
      </main>
    </div>
    <CmsToaster client:load />
  </body>
</html>
```

- [ ] **Step 2: `src/components/admin/AdminNav.tsx`** — sidebar com links de CLÍNICA (não blog). Use o esqueleto `<aside>` do scaffold como referência, mas com esta lista:

```tsx
import { LayoutDashboard, Users2, Building2, LogOut } from 'lucide-react';

interface Props { activeSection?: string; }

const links = [
  { label: 'Leads', href: '/admin', icon: LayoutDashboard, key: 'leads' },
  { label: 'Dados da clínica', href: '/admin/config', icon: Building2, key: 'config' },
];

export default function AdminNav({ activeSection = '' }: Props) {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-stone-200 flex flex-col">
      <a href="/admin" className="px-6 h-16 flex items-center font-bold text-teal-800 text-lg border-b border-stone-200">
        Painel da clínica
      </a>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((l) => {
          const Icon = l.icon;
          const active = activeSection === l.key;
          return (
            <a
              key={l.key}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              <Icon size={18} /> {l.label}
            </a>
          );
        })}
      </nav>
      <a href="/api/admin/logout" className="m-4 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-100">
        <LogOut size={18} /> Sair
      </a>
    </aside>
  );
}
```

> `Users2` import sobra por ora — pode remover ou deixar; é usado quando adicionarmos editores de equipe. Mantenha só os ícones realmente usados pra não dar warning.

- [ ] **Step 3: Verificar** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(cms): AdminLayout enxuto + AdminNav de clínica"`

---

### Task 5: Mover o painel de Leads pra DENTRO do shell

**Files:** Modify `src/pages/admin/index.astro`

> O clinify já tem `/admin/index.astro` (tabela de leads server-rendered standalone). Agora ele passa a usar a AdminLayout, ficando dentro da casca com a sidebar.

- [ ] **Step 1: Reescrever `src/pages/admin/index.astro`**

```astro
---
export const prerender = false;
import AdminLayout from '../../layouts/AdminLayout.astro';
import { readFileFromRepo } from '../../lib/server-io';
const raw = await readFileFromRepo('src/data/subscribers.json');
const leads = (raw ? JSON.parse(raw) : []).slice().reverse();
const fmt = (iso: string) => { try { return new Date(iso).toLocaleString('pt-BR'); } catch { return iso; } };
---
<AdminLayout title="Leads" activeSection="leads">
  <h1 class="text-2xl font-bold text-stone-900 mb-1">Contatos recebidos</h1>
  <p class="text-stone-500 text-sm mb-6">{leads.length} {leads.length === 1 ? 'lead' : 'leads'}</p>
  {leads.length === 0 ? (
    <div class="bg-white border border-stone-200 rounded-xl p-8 text-center text-stone-500">
      Nenhum lead ainda. Quando alguém preencher o formulário do site, aparece aqui.
    </div>
  ) : (
    <div class="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-stone-50 text-stone-700">
          <tr>
            <th class="text-left px-4 py-3 font-semibold">Recebido</th>
            <th class="text-left px-4 py-3 font-semibold">Nome</th>
            <th class="text-left px-4 py-3 font-semibold">Telefone</th>
            <th class="text-left px-4 py-3 font-semibold">E-mail</th>
            <th class="text-left px-4 py-3 font-semibold">Serviço</th>
            <th class="text-left px-4 py-3 font-semibold">Mensagem</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l: any) => (
            <tr class="border-t border-stone-200 align-top">
              <td class="px-4 py-3 text-stone-600 whitespace-nowrap">{fmt(l.recebidoEm)}</td>
              <td class="px-4 py-3 text-stone-900">{l.nome}</td>
              <td class="px-4 py-3 text-stone-600">{l.telefone}</td>
              <td class="px-4 py-3 text-stone-600">{l.email || '—'}</td>
              <td class="px-4 py-3">{l.servico ? <span class="bg-teal-50 text-teal-800 rounded-full px-2 py-0.5 text-xs">{l.servico}</span> : '—'}</td>
              <td class="px-4 py-3 text-stone-600">{l.mensagem || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</AdminLayout>
```

- [ ] **Step 2: Verificar** — `bun run build` → PASS.
- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(cms): painel de leads dentro da AdminLayout"`

---

### Task 6: Editor de prova — Dados da clínica (`siteConfig.json`)

**Files:** Create `src/components/admin/SiteConfigEditor.tsx`, `src/pages/admin/config.astro`

> Replica o padrão `ContatoEditor` do scaffold: load via `githubApi('read')`, save via `githubApi('write')`. Estilo em core utilities. **Não** altera o `siteConfig.json` em si — só lê/escreve via o editor.

- [ ] **Step 1: `src/components/admin/SiteConfigEditor.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { githubApi } from '../../lib/adminApi';
import { triggerToast } from './CmsToaster';

const FIELDS: [string, string][] = [
  ['name', 'Nome da clínica'],
  ['description', 'Descrição (frase curta)'],
  ['phone', 'Telefone'],
  ['whatsapp', 'WhatsApp (só números, com DDI)'],
  ['email', 'E-mail'],
  ['address', 'Endereço'],
  ['hours', 'Horário de atendimento'],
];

export default function SiteConfigEditor() {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [sha, setSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    githubApi('read', 'src/data/siteConfig.json')
      .then((d: any) => { setData(JSON.parse(d?.content || '{}')); setSha(d?.sha); })
      .catch((e: any) => setError(e?.message || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setData((p) => ({ ...(p || {}), [k]: v }));

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res: any = await githubApi('write', 'src/data/siteConfig.json', {
        content: JSON.stringify(data, null, 2),
        sha,
        message: 'CMS: dados da clínica',
      });
      setSha(res?.sha);
      triggerToast('Dados salvos!', 'success');
    } catch (e: any) {
      triggerToast(e?.message || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-stone-500">Carregando…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-1">Dados da clínica</h1>
      <p className="text-stone-500 text-sm mb-6">Aparece no cabeçalho, rodapé e contato do site.</p>
      <div className="space-y-4">
        {FIELDS.map(([k, label]) => (
          <label key={k} className="block">
            <span className="block text-sm font-semibold text-stone-700 mb-1">{label}</span>
            <input
              className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:border-teal-700 focus:outline-none"
              value={data?.[k] ?? ''}
              onChange={(e) => set(k, e.target.value)}
            />
          </label>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-6 px-6 py-3 rounded-full bg-amber-500 text-stone-900 font-semibold hover:brightness-95 disabled:opacity-50"
      >
        {saving ? 'Salvando…' : 'Salvar'}
      </button>
    </div>
  );
}
```

> Se o `CmsToaster` portado exportar o toast com outro nome (Task 3), ajuste o import/uso aqui.

- [ ] **Step 2: `src/pages/admin/config.astro`**

```astro
---
export const prerender = false;
import AdminLayout from '../../layouts/AdminLayout.astro';
import SiteConfigEditor from '../../components/admin/SiteConfigEditor';
---
<AdminLayout title="Dados da clínica" activeSection="config">
  <SiteConfigEditor client:load />
</AdminLayout>
```

- [ ] **Step 3: Verificar build** — `bun run build` → PASS.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(cms): editor Dados da clínica (prova do padrão de edição)"`

---

### Task 7: Verificação end-to-end (dev)

**Files:** nenhum

- [ ] **Step 1: Subir dev, logar, abrir o shell**

```bash
cd /c/Projects/clinify && (bun run dev >/tmp/cli-dev.log 2>&1 &) && sleep 6
PORT=$(grep -oE 'localhost:[0-9]+' /tmp/cli-dev.log | head -1 | cut -d: -f2); echo "porta: $PORT"
# login
curl -s -c /tmp/ck.txt -o /dev/null -w "login:%{http_code}\n" -X POST http://localhost:$PORT/api/admin/login -H 'Content-Type: application/json' -d '{"password":"clinify-dev-123"}'
# shell renderiza com sidebar?
curl -s -b /tmp/ck.txt http://localhost:$PORT/admin | grep -o "Painel da clínica" | head -1
curl -s -b /tmp/ck.txt http://localhost:$PORT/admin/config | grep -o "Dados da clínica" | head -1
```
Expected: `login:200`; `/admin` tem "Painel da clínica" (sidebar); `/admin/config` tem "Dados da clínica".

- [ ] **Step 2: Editar siteConfig via o endpoint de save (simula o editor) e conferir persistência**

```bash
# lê o sha atual
SHA=$(curl -s -b /tmp/ck.txt -X POST http://localhost:$PORT/api/admin/github -H 'Content-Type: application/json' -d '{"action":"read","path":"src/data/siteConfig.json"}' | grep -oE '"sha":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "sha: $SHA"
# escreve um nome de teste
curl -s -b /tmp/ck.txt -X POST http://localhost:$PORT/api/admin/github -H 'Content-Type: application/json' \
  -d "{\"action\":\"write\",\"path\":\"src/data/siteConfig.json\",\"content\":\"{\\\"name\\\":\\\"Clínica Sorriso EDITADA\\\"}\",\"sha\":\"$SHA\",\"message\":\"teste\"}" -o /dev/null -w "write:%{http_code}\n"
echo "=== siteConfig.json agora ===" && cat src/data/siteConfig.json
```
Expected: `write:200`; `siteConfig.json` mostra `"name": "Clínica Sorriso EDITADA"`.

- [ ] **Step 3: Reverter o teste + build final**

```bash
cd /c/Projects/clinify && git checkout src/data/siteConfig.json && bun run build 2>&1 | tail -3
# matar dev server
(netstat -ano 2>/dev/null | grep ":$PORT" | grep LISTENING | awk '{print $5}' | sort -u | while read pid; do taskkill //PID $pid //F 2>/dev/null; done); pkill -f "astro dev" 2>/dev/null; echo "dev off"
```
Expected: `siteConfig.json` revertido pro original; build verde.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "test(cms): verificação e2e do shell admin + edição de siteConfig"`

---

## Critério de pronto

- [ ] `/admin` (logado) mostra a casca com sidebar (Leads, Dados da clínica, Sair), colorida (core utilities) — não "sem cor"
- [ ] Painel de Leads vive dentro da AdminLayout
- [ ] `/admin/config` carrega o editor; o save persiste em `siteConfig.json` (testado e2e via `github.ts`)
- [ ] Site da clínica INTOCADO: `bun run build` verde, `/`, `/servicos`, `/blog` etc. inalterados
- [ ] Sem token custom no admin (só core utilities); `tailwind.config.mjs` e tema da clínica não tocados

## Guard-rail (repetindo — não violar)
Frontend da clínica é PROIBIDO: blocos, layout, global.css, theme.ts, themes/, BaseLayout, index, blog, content. O admin é mundo separado em `/admin/*` + `src/components/admin/*` + `src/lib/{adminApi,server-io,auth}.ts` + `src/pages/api/admin/*`.

## Próxima fase (depois desta)
Replicar o padrão `SiteConfigEditor` pra: `page.json` (composição/conteúdo dos blocos da home), `theme.json` (trocar preset + ajustar primary), as 5 páginas (`src/data/pages/*.json`) e os posts do blog. Cada um = 1 página `.astro` + 1 editor React via `githubApi`. A fundação (shell + save) já estará pronta.
</content>
