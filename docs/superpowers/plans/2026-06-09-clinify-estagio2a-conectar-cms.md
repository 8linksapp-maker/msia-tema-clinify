# Clinify — Estágio 2A: Conectar o CMS (auth + persistência + lead) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps usam checkbox (`- [ ]`).

**Goal:** Conectar a casca do CMS do `msia-scaffold` no clinify — adapter Vercel + auth de admin + persistência + endpoint `/api/subscribe` funcional + painel de leads. Resultado: o formulário de contato/agendar CAPTURA leads de verdade e a clínica vê os leads num `/admin` protegido.

**Architecture:** Porte do conjunto MÍNIMO do scaffold (8 arquivos núcleo, todos battle-tested). Auth = cookie HMAC assinado (WebCrypto, `ADMIN_SECRET`). Persistência = `server-io` (dev: filesystem `node:fs`; prod: GitHub Contents API). Rotas admin/API são on-demand (`prerender = false`); páginas de marketing/blog continuam estáticas. **Sem React** — login e painel de leads são server-rendered. O form público já existe (`src/blocks/CtaContato.astro` → `/api/subscribe`); só falta o endpoint + um wiring de submit.

**Tech Stack:** Astro 5.1 (`output: 'static'` + adapter `@astrojs/vercel`, hybrid via `prerender=false`), WebCrypto, `node:fs`. Zero deps novas além do adapter.

**Fonte do porte:** `C:\Projects\msia-scaffold` (arquivos reais — copiar, não inventar).

**Escopo:** 2A só. O **2B** (mapear todas as props de bloco → editores no admin) é o próximo passo, plano separado.

---

## File Structure (delta)

```
NOVO (porte do scaffold, copiar verbatim + trims indicados):
  src/lib/auth.ts                      ← de msia-scaffold/src/lib/auth.ts (verbatim)
  src/lib/server-io.ts                 ← de msia-scaffold/src/plugins/_server.ts (trim)
  src/middleware.ts                    ← de msia-scaffold/src/middleware.ts (remove redirects)
  src/pages/api/admin/login.ts         ← verbatim
  src/pages/api/admin/logout.ts        ← verbatim
NOVO (código próprio do clinify):
  src/pages/api/subscribe.ts           ← payload de clínica {nome,telefone,email,servico,mensagem}
  src/pages/admin/login.astro          ← porte adaptado (sem admin.css do blog)
  src/pages/admin/index.astro          ← painel de leads server-rendered
  src/data/subscribers.json            ← []
  .env.example
MODIFICA:
  astro.config.mjs                     ← + adapter vercel()
  package.json                         ← + @astrojs/vercel
  src/blocks/CtaContato.astro          ← + <script> de submit (progressive enhancement)
  .gitignore                           ← garantir .env ignorado (já está)
```

> **Nota de env (do mapeamento):** `auth.ts` lê `import.meta.env.ADMIN_SECRET`; `server-io` lê `process.env.GITHUB_*`. Essa mistura é a do scaffold em produção (86 sites) — **portar como está, não "consertar".** Em dev sem `GITHUB_*`, o `server-io` cai em filesystem automaticamente.

---

### Task 1: Adapter Vercel + deps + env

**Files:** Modify `astro.config.mjs`, `package.json`; Create `.env.example`, `src/data/subscribers.json`

- [ ] **Step 1: Instalar adapter** — `cd /c/Projects/clinify && bun add @astrojs/vercel`

- [ ] **Step 2: `astro.config.mjs`** — adicionar o adapter (mantém sitemap e tailwind existentes)

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://clinicasorriso.com.br',
  output: 'static',
  adapter: vercel(),
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
});
```

> `output: 'static'` + adapter = híbrido: páginas de marketing/blog continuam pré-renderizadas (CDN); só os arquivos com `export const prerender = false` (admin/api) rodam on-demand.

- [ ] **Step 3: `src/data/subscribers.json`**

```json
[]
```

- [ ] **Step 4: `.env.example`**

```
# Senha do painel admin (sem ela, /admin mostra tela de aviso)
ADMIN_SECRET=

# Persistência em produção (GitHub Contents API). Em dev, sem isso, grava no filesystem.
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
```

- [ ] **Step 5: Criar `.env` local pra testar** (não commitar)

Run:
```bash
cd /c/Projects/clinify && printf 'ADMIN_SECRET=clinify-dev-123\n' > .env
grep -q '^\.env$' .gitignore || echo '.env' >> .gitignore
```

- [ ] **Step 6: Verificar build com adapter**

Run: `cd /c/Projects/clinify && bun run build`
Expected: PASS — gera `.vercel/output/`. (Páginas estáticas + funções server.)

- [ ] **Step 7: Commit** — `git add -A && git commit -m "chore(cms): adapter vercel + env + subscribers.json (base do estágio 2A)"`

---

### Task 2: Auth + middleware (porte)

**Files:** Create `src/lib/auth.ts`, `src/middleware.ts`

- [ ] **Step 1: Portar `auth.ts` VERBATIM**

Copie `C:\Projects\msia-scaffold\src\lib\auth.ts` → `C:\Projects\clinify\src\lib\auth.ts` sem alterar nada. (Zero deps externas; usa WebCrypto + `import.meta.env.ADMIN_SECRET`.)

Verificação do conteúdo: deve exportar `createSession`, `validateSession`, `signAttempts`, `readAttempts`, `MAX_LOGIN_ATTEMPTS`, `COOKIE_NAME_EXPORT`, `ATTEMPTS_COOKIE_EXPORT`, `ATTEMPTS_EXPIRES_SEC_EXPORT`.

- [ ] **Step 2: Portar `middleware.ts` com TRIM**

Copie `C:\Projects\msia-scaffold\src\middleware.ts` → `C:\Projects\clinify\src\middleware.ts`, então **remova o bloco de redirects** (o cache de `src/data/redirects.json` e a lógica que o usa — no scaffold são ~as linhas 8-41). **Mantenha:**
- o import `validateSession` de `./lib/auth`
- a proteção: `/admin*` (páginas → redirect `/admin/login`; já logado e formato ok → segue), `/api/admin*` (→ 401 JSON), com pass-through pra `/admin/login`, `/api/admin/login`, `/api/admin/logout`
- a **tela fallback sem `ADMIN_SECRET`** (HTML inline, ~linhas 49-68)

Após o trim, o `middleware.ts` não deve mais importar `node:fs`/`node:path` (eram do redirects). Se sobrar import órfão, remova.

- [ ] **Step 3: Verificar** — `bun run build` → PASS (sem import quebrado).

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(cms): auth HMAC (porte) + middleware de admin (sem redirects)"`

---

### Task 3: Persistência (`server-io`)

**Files:** Create `src/lib/server-io.ts`

- [ ] **Step 1: Portar `_server.ts` → `server-io.ts` com trim**

Copie `C:\Projects\msia-scaffold\src\plugins\_server.ts` → `C:\Projects\clinify\src\lib\server-io.ts`. **Mantenha** as funções que o lead/admin usam:
- `readDataFile<T>(filename, fallback): T` (sync, lê `src/data/<filename>`)
- `readFileFromRepo(filePath, options?): Promise<string|null>`
- `writeFileToRepo(filePath, content, options?): Promise<boolean>`
- a lógica `isDevMode` (sem `GITHUB_TOKEN/OWNER/REPO` em `process.env` → filesystem `node:fs`; com → GitHub Contents API)

**Remova** (baggage não usada pelo lead): `readPluginsConfig`, `writeBinaryToRepo`, `fileExistsInRepo` — **só se** removê-las não quebrar nada que sobrou. Se houver acoplamento interno, mantenha. Não é obrigatório enxugar; o objetivo é ter `readFileFromRepo`/`writeFileToRepo` funcionando.

> Não troque `process.env` por `import.meta.env` aqui — é o padrão de prod do scaffold.

- [ ] **Step 2: Verificar** — `bun run build` → PASS.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(cms): server-io (persistência dev fs / prod GitHub)"`

---

### Task 4: Login/logout do admin (porte)

**Files:** Create `src/pages/api/admin/login.ts`, `src/pages/api/admin/logout.ts`, `src/pages/admin/login.astro`

- [ ] **Step 1: Portar `login.ts` e `logout.ts` VERBATIM**

- `C:\Projects\msia-scaffold\src\pages\api\admin\login.ts` → `src/pages/api/admin/login.ts`
- `C:\Projects\msia-scaffold\src\pages\api\admin\logout.ts` → `src/pages/api/admin/logout.ts`

Confirme que ambos têm `export const prerender = false;` e que `login.ts` importa de `../../../lib/auth` (ajuste o caminho relativo se a profundidade divergir).

- [ ] **Step 2: `src/pages/admin/login.astro`** (versão limpa, sem depender do `admin.css` do blog)

```astro
---
export const prerender = false;
import { validateSession, COOKIE_NAME_EXPORT } from '../../lib/auth';
const cookie = Astro.cookies.get(COOKIE_NAME_EXPORT)?.value;
if (cookie && (await validateSession(cookie))) return Astro.redirect('/admin');
const noSecret = !import.meta.env.ADMIN_SECRET;
---
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Entrar — Painel</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root { --p:#0E384C; --a:#FFA800; --b:#E1ECF2; --soft:#EFF8FF; }
    * { box-sizing: border-box; }
    body { font-family: 'Poppins', system-ui, sans-serif; margin:0; min-height:100vh; display:grid; place-items:center; background:var(--soft); color:var(--p); }
    .card { background:#fff; border:1px solid var(--b); border-radius:16px; padding:2rem; width:min(92vw,360px); }
    h1 { font-size:1.25rem; margin:0 0 1.25rem; }
    label { font-size:.85rem; font-weight:600; display:block; margin-bottom:.35rem; }
    input { width:100%; padding:.7rem .9rem; border:1px solid var(--b); border-radius:10px; font:inherit; }
    button { width:100%; margin-top:1rem; padding:.7rem; border:0; border-radius:999px; background:var(--a); color:var(--p); font-weight:600; cursor:pointer; }
    .err { color:#b3261e; font-size:.85rem; margin-top:.75rem; min-height:1.2em; }
    .warn { background:#fff7e6; border:1px solid var(--a); border-radius:10px; padding:.75rem; font-size:.85rem; }
  </style>
</head>
<body>
  <form class="card" id="f">
    <h1>Painel da clínica</h1>
    {noSecret ? (
      <p class="warn">Configure <code>ADMIN_SECRET</code> no ambiente para ativar o login.</p>
    ) : (
      <>
        <label for="pw">Senha</label>
        <input id="pw" name="password" type="password" autocomplete="current-password" required />
        <button type="submit">Entrar</button>
        <p class="err" id="e"></p>
      </>
    )}
  </form>
  <script>
    const f = document.getElementById('f');
    f?.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const e = document.getElementById('e');
      const password = (document.getElementById('pw')).value;
      const r = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password }) });
      if (r.ok) { location.href = '/admin'; } else { const j = await r.json().catch(()=>({})); e.textContent = j.error || 'Senha incorreta.'; }
    });
  </script>
</body>
</html>
```

> Se o `login.ts` portado esperar o campo com outro nome (ex.: `pass` em vez de `password`), ajuste o `body` do fetch acima pra casar. Confira lendo o `login.ts`.

- [ ] **Step 3: Verificar** — `bun run build` → PASS.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(cms): login/logout do admin (porte) + tela de login clinify"`

---

### Task 5: Endpoint `/api/subscribe` (payload de clínica)

**Files:** Create `src/pages/api/subscribe.ts`

- [ ] **Step 1: `src/pages/api/subscribe.ts`**

```ts
import type { APIRoute } from 'astro';
import { readFileFromRepo, writeFileToRepo } from '../../lib/server-io';

export const prerender = false;

interface Lead {
  nome: string;
  telefone: string;
  email?: string;
  servico?: string;
  mensagem?: string;
  recebidoEm: string;
  origem: string;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  try {
    const ct = request.headers.get('content-type') || '';
    let body: Record<string, string> = {};
    if (ct.includes('application/json')) {
      body = await request.json();
    } else {
      const fd = await request.formData();
      body = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
    }

    const nome = (body.nome || '').trim();
    const telefone = (body.telefone || '').trim();
    if (!nome || !telefone) {
      return json({ error: 'Nome e telefone são obrigatórios.' }, 400);
    }

    const lead: Lead = {
      nome,
      telefone,
      email: (body.email || '').trim() || undefined,
      servico: (body.servico || '').trim() || undefined,
      mensagem: (body.mensagem || '').trim() || undefined,
      recebidoEm: new Date().toISOString(),
      origem: (body.origem || 'site').trim(),
    };

    const raw = await readFileFromRepo('src/data/subscribers.json');
    const leads: Lead[] = raw ? JSON.parse(raw) : [];
    leads.push(lead);
    await writeFileToRepo('src/data/subscribers.json', JSON.stringify(leads, null, 2), {
      message: `lead: ${nome}`,
    });

    // fallback sem JS (form nativo): redireciona com flag de sucesso
    if (!ct.includes('application/json')) {
      return new Response(null, { status: 303, headers: { Location: '/contato?enviado=1' } });
    }
    return json({ ok: true });
  } catch (err: any) {
    return json({ error: err?.message || 'Erro ao enviar.' }, 500);
  }
};
```

- [ ] **Step 2: Verificar** — `bun run build` → PASS.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(lead): endpoint /api/subscribe com payload de clínica + persistência"`

---

### Task 6: Wiring do form (CtaContato — progressive enhancement)

**Files:** Modify `src/blocks/CtaContato.astro`

> **Escopo:** só ADICIONAR um `<script>` no fim do componente. NÃO mexer no layout/markup do form. (Sem JS, o form nativo já funciona via o fallback 303 do endpoint.)

- [ ] **Step 1: Adicionar ao fim de `src/blocks/CtaContato.astro`** (depois do `</section>`)

```astro
<script>
  document.querySelectorAll('form[action="/api/subscribe"]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const data = Object.fromEntries(new FormData(form).entries());
      if (btn) btn.disabled = true;
      try {
        const r = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!r.ok) throw new Error();
        form.innerHTML = '<p class="text-ink font-medium py-4">Recebemos seu contato! Em breve a gente retorna.</p>';
      } catch {
        if (btn) btn.disabled = false;
        alert('Não foi possível enviar agora. Tente novamente ou ligue para a gente.');
      }
    });
  });
</script>
```

- [ ] **Step 2: Verificar** — `bun run build` → PASS (o `<script>` vai pra todas as páginas que usam o bloco).

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(lead): wiring fetch do form CtaContato (fallback nativo preservado)"`

---

### Task 7: Painel de leads (`/admin` server-rendered)

**Files:** Create `src/pages/admin/index.astro`

- [ ] **Step 1: `src/pages/admin/index.astro`**

```astro
---
export const prerender = false;
import { readFileFromRepo } from '../../lib/server-io';
const raw = await readFileFromRepo('src/data/subscribers.json');
const leads = (raw ? JSON.parse(raw) : []).slice().reverse();
const fmt = (iso: string) => { try { return new Date(iso).toLocaleString('pt-BR'); } catch { return iso; } };
---
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Leads — Painel</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root { --p:#0E384C; --a:#FFA800; --b:#E1ECF2; --soft:#EFF8FF; --muted:#527282; }
    * { box-sizing:border-box; }
    body { font-family:'Poppins',system-ui,sans-serif; margin:0; background:var(--soft); color:var(--p); }
    header { background:#fff; border-bottom:1px solid var(--b); padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center; }
    header strong { font-size:1.05rem; }
    header a { color:var(--muted); text-decoration:none; font-size:.9rem; }
    main { max-width:1100px; margin:0 auto; padding:1.5rem; }
    h1 { font-size:1.25rem; }
    .count { color:var(--muted); font-size:.9rem; margin-bottom:1rem; }
    table { width:100%; border-collapse:collapse; background:#fff; border:1px solid var(--b); border-radius:12px; overflow:hidden; }
    th, td { text-align:left; padding:.75rem 1rem; border-bottom:1px solid var(--b); font-size:.9rem; vertical-align:top; }
    th { background:var(--soft); font-weight:600; }
    tr:last-child td { border-bottom:0; }
    .empty { background:#fff; border:1px solid var(--b); border-radius:12px; padding:2rem; text-align:center; color:var(--muted); }
    .tag { background:var(--soft); border:1px solid var(--b); border-radius:999px; padding:.1rem .6rem; font-size:.75rem; }
  </style>
</head>
<body>
  <header>
    <strong>Painel da clínica · Leads</strong>
    <a href="/api/admin/logout">Sair</a>
  </header>
  <main>
    <h1>Contatos recebidos</h1>
    <p class="count">{leads.length} {leads.length === 1 ? 'lead' : 'leads'}</p>
    {leads.length === 0 ? (
      <div class="empty">Nenhum lead ainda. Quando alguém preencher o formulário do site, aparece aqui.</div>
    ) : (
      <table>
        <thead>
          <tr><th>Recebido</th><th>Nome</th><th>Telefone</th><th>E-mail</th><th>Serviço</th><th>Mensagem</th></tr>
        </thead>
        <tbody>
          {leads.map((l: any) => (
            <tr>
              <td>{fmt(l.recebidoEm)}</td>
              <td>{l.nome}</td>
              <td>{l.telefone}</td>
              <td>{l.email || '—'}</td>
              <td>{l.servico ? <span class="tag">{l.servico}</span> : '—'}</td>
              <td>{l.mensagem || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </main>
</body>
</html>
```

- [ ] **Step 2: Verificar** — `bun run build` → PASS.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(cms): painel de leads server-rendered em /admin"`

---

### Task 8: Verificação end-to-end (dev) + build

**Files:** nenhum (só verificação)

- [ ] **Step 1: Subir dev e testar o fluxo de lead (filesystem mode, sem GitHub)**

Run (sobe o dev em background, posta um lead, confere persistência):
```bash
cd /c/Projects/clinify && (bun run dev >/tmp/clinify-dev.log 2>&1 &) && sleep 5
curl -s -X POST http://localhost:4321/api/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Maria Teste","telefone":"11999990000","email":"maria@ex.com","servico":"Clareamento","mensagem":"Quero avaliar"}'
echo ""
echo "=== subscribers.json ==="
cat src/data/subscribers.json
```
Expected: resposta `{"ok":true}`; `subscribers.json` agora contém o lead "Maria Teste" com `recebidoEm`.

- [ ] **Step 2: Conferir proteção do admin**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/admin
curl -s http://localhost:4321/admin/login | grep -o "Painel da clínica" | head -1
```
Expected: `/admin` → `302` (redirect pro login, sem sessão); `/admin/login` renderiza "Painel da clínica".

- [ ] **Step 3: Login + ver lead no painel**

Run:
```bash
# loga com ADMIN_SECRET=clinify-dev-123, guarda cookie, acessa /admin
curl -s -c /tmp/ck.txt -X POST http://localhost:4321/api/admin/login \
  -H 'Content-Type: application/json' -d '{"password":"clinify-dev-123"}' -o /dev/null -w "login:%{http_code}\n"
curl -s -b /tmp/ck.txt http://localhost:4321/admin | grep -o "Maria Teste" | head -1
```
Expected: `login:200`; `/admin` autenticado mostra "Maria Teste". (Se o campo do login.ts não for `password`, ajustar — ver Task 4.)

> Pare o dev server depois: ache o PID em `/tmp/clinify-dev.log` ou mate a porta 4321.

- [ ] **Step 4: Limpar o lead de teste e build final**

Run:
```bash
cd /c/Projects/clinify && echo "[]" > src/data/subscribers.json && bun run build 2>&1 | tail -3
```
Expected: build verde.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "test(cms): verificação e2e do fluxo de lead + auth (estágio 2A)"`

---

## Critério de pronto

- [ ] `POST /api/subscribe` grava o lead em `subscribers.json` (dev: fs) — testado e2e (Task 8.1)
- [ ] Form do site (`CtaContato`) envia via fetch com feedback; fallback nativo funciona sem JS
- [ ] `/admin` protegido (302 sem sessão); `/admin/login` loga com `ADMIN_SECRET`
- [ ] `/admin` autenticado lista os leads (nome, telefone, email, serviço, mensagem, data)
- [ ] `bun run build` verde com adapter Vercel (gera `.vercel/output/`)
- [ ] Sem React, sem baggage de blog/plugins

## Próximo (Estágio 2B — depois, plano separado)

Mapear TODAS as props dos blocos (`page.json`, `theme.json`, `siteConfig.json`, as 5 pages e os posts) e gerar editores no `/admin` pra clínica editar conteúdo + tema + composição de página sem código. O persistir já está pronto (`writeFileToRepo` + commit em prod dispara rebuild). É só construir as telas de edição por cima desta fundação.

## Prod (quando for pro ar — fora do escopo de hoje)
Setar no Vercel: `ADMIN_SECRET`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`. Aí o `writeFileToRepo` comita no repo → rebuild automático → leads e edições persistem entre deploys.
</content>
