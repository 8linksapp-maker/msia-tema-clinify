# Clinify — Embarcar o CMS do scaffold INTEIRO (idêntico) Procedure

> **For agentic workers:** Procedimento de integração (não bite-sized). Objetivo: `/admin` do clinify renderizar IDÊNTICO ao admin do `msia-scaffold` (dashboard, nav completa, editores, look Café-da-Tarde), trazendo o admin INTEIRO sem podar. Frontend da clínica INTOCADO.

**Decisão do Bruno:** trazer o admin do scaffold 100% como está (inclusive blog: Artigos/Categorias/Autores/plugins), só pra aparecer idêntico primeiro. Poda e adaptação pra clínica = próximo passo.

**Fonte:** `C:\Projects\msia-scaffold`. **Destino:** `C:\Projects\clinify`.

---

## 🚫 GUARD-RAIL ABSOLUTO (quebrou, falhou a tarefa)

NUNCA sobrescrever, deletar ou editar estes arquivos do clinify (frontend do Francis):
- `src/pages/index.astro`, `src/pages/[slug].astro`, `src/pages/blog/**`
- `src/blocks/**`, `src/components/layout/**`, `src/components/ThemeStyle.astro`
- `src/layouts/BaseLayout.astro`
- `src/styles/global.css`, `src/lib/theme.ts`, `src/data/themes/**`
- `src/content.config.ts`, `src/content/**`
- `src/data/page.json`, `src/data/theme.json`, `src/data/siteConfig.json` (conteúdo)
- `tailwind.config.mjs` → só ADICIONAR tokens `adm-*` (ver passo 4); NÃO alterar os tokens existentes da clínica
- Já existentes e funcionando: `src/middleware.ts`, `src/lib/auth.ts`, `src/pages/api/subscribe.ts`, `src/pages/api/admin/login.ts`, `src/pages/api/admin/logout.ts`, `src/pages/admin/login.astro`

**Se um arquivo do admin do scaffold conflitar e impedir o build, NÃO resolva mexendo no frontend da clínica. Stube/comente o arquivo problemático do admin e reporte.** Antes de começar: `git checkout -b cms-scaffold-completo` (branch de segurança).

---

## Passo 1 — Deps do admin (todas, sem poda)

```bash
cd /c/Projects/clinify
bun add marked jszip fast-xml-parser react-quill-new
bun add -d @tailwindcss/typography
```
(react, react-dom, @astrojs/react, lucide-react já estão.)

Se algum pacote exigir versão específica e quebrar, fixe a linha compatível com Astro 5 / React 19 e anote.

## Passo 2 — Copiar as árvores de ADMIN do scaffold (NÃO o frontend)

Copie do scaffold pro clinify (preservando estrutura). **Traga TUDO destes:**

- `src/components/admin/**` → `src/components/admin/` (todos: PostEditor, PostsManager, ConfigEditor, MenuEditor, AuthorsEditor, CategoriesEditor, SobreEditor, ContatoEditor, LegalEditor, BackupManager, DeployManager, PluginsHub, CmsDashboard, AdminNav, CmsToaster, RepoVisibilityBanner). **Sobrescreve** os que eu já tinha posto (AdminNav, CmsToaster, SiteConfigEditor pode remover — o scaffold tem ConfigEditor).
- `src/pages/admin/**` → `src/pages/admin/` (todos: index.astro=dashboard, posts/, categories, authors, ai, menu, sobre, contato, legal, config, plugins, backup, adsense, affiliates, email-list, meta-pixel, google-tag, import-wp, search-console, social-share, cookie-consent). **Sobrescreve** o meu `admin/index.astro` (leads) pelo dashboard do scaffold. **NÃO traga** `admin/login.astro` (clinify já tem).
- `src/pages/api/admin/**` → `src/pages/api/admin/` (todos: github.ts, commit.ts, deploy.ts, deploy-status.ts, export.ts, import.ts, repo-visibility.ts, amazon-product.ts, categories/, plugins/). **NÃO traga** `login.ts`/`logout.ts` (clinify já tem).
- `src/pages/api/cron/**` → `src/pages/api/cron/` (se referenciado).
- `src/plugins/**` → `src/plugins/` (todos os 14 + `_server.ts`, `_adapter.ts`, `_slots/`). Obs: `_server.ts` ≈ o `server-io.ts` do clinify; mantenha os dois (o admin usa `_server`, o subscribe usa `server-io`).
- `src/layouts/AdminLayout.astro` → `src/layouts/AdminLayout.astro` (versão COMPLETA do scaffold, com o `<style is:global>` do Quill — sobrescreve a minha enxuta).
- `src/styles/admin.css` → `src/styles/admin.css` (sobrescreve a minha).

**lib closure** — copie os helpers que o admin/plugins importam e que o clinify ainda não tem:
`src/lib/repoIo.ts`, `repoAtomicCommit.ts`, `categoryColors.ts`, `categorySlug.ts`, `postUrl.ts`, `slugify.ts`, `shortcodes.ts`, `videoEmbed.ts`, `yamlEscape.ts`, `vercelJson.ts`, `robotsDefault.ts`, `templateConfig.ts`, `readData.ts`. (`adminApi.ts`, `auth.ts`, `server-io.ts` já estão.)

## Passo 3 — Dados que os editores leem (só os que o clinify NÃO tem)

Copie do scaffold `src/data/` → clinify `src/data/` APENAS os ausentes:
`categories.json`, `authors.json`, `menu.json`, `home.json`, `sobre.json`, `contato.json`, `privacy.json`, `terms.json`, `pluginsConfig.json`, `pluginRegistry.json`, `pluginVersions.json`, `redirects.json`, `affiliateProducts.json`, `emailsSent.json`, `version.json`.
**NÃO sobrescreva** `siteConfig.json`, `page.json`, `theme.json`, `subscribers.json` (são do clinify).

## Passo 4 — Resolver o token clash (namespace `adm-`)

Os componentes admin usam tokens Tailwind do scaffold (`bg-surface`, `bg-elev`, `text-ink`, `text-ink-muted`, `text-ink-faint`, `bg-primary`, `text-primary`, `bg-primary-soft`, `border-border`, `border-rule`, `bg-rule`, `bg-bg`, e `cat-*`). Esses nomes colidem com os da clínica em formato incompatível.

**Solução:** namesp> renomear os tokens SÓ nos arquivos de admin, e definir `adm-*` literais no tailwind.

4a. **Sed nos arquivos de admin** (`src/components/admin/**`, `src/layouts/AdminLayout.astro`, `src/pages/admin/**`, `src/plugins/**/Settings*.tsx` e qualquer `.tsx`/`.astro` de admin) — substitua as CLASSES (com todos os prefixos de variante `hover:`/`focus:`/`md:` etc.):
```
bg-bg→bg-adm-bg   bg-surface→bg-adm-surface   bg-elev→bg-adm-elev   bg-rule→bg-adm-rule
border-border→border-adm-border   border-rule→border-adm-rule
text-ink→text-adm-ink   text-ink-muted→text-adm-ink-muted   text-ink-faint→text-adm-ink-faint
bg-primary→bg-adm-primary   text-primary→text-adm-primary   bg-primary-soft→bg-adm-primary-soft
ring-primary→ring-adm-primary   border-primary→border-adm-primary
```
Para `bg-cat-*`/`text-cat-*` (cores de categoria, usadas no admin de blog): renomeie pra `bg-adm-cat-*`/`text-adm-cat-*`.
> Faça com cuidado pra não pegar substrings erradas (ex: `bg-bg` não pode virar parte de `bg-bgX`). Use limites de palavra. Depois, **grep de verificação**: nenhuma classe `(bg|text|border|ring)-(surface|elev|ink|ink-muted|ink-faint|primary|primary-soft|rule|border|cat-)` sem o `adm-` pode sobrar em arquivos de admin.

4b. **tailwind.config.mjs** — ADICIONAR (sem mexer nos tokens da clínica) o set `adm-*` com os valores literais Café-da-Tarde do scaffold (pegue os hex/rgb reais do `tailwind.config.mjs` do scaffold ou do `admin.css`):
```js
// dentro de theme.extend.colors, adicionar:
'adm-bg': '#FAF8F4', 'adm-surface': '#FFFEFB', 'adm-elev': '#F0ECE4',
'adm-border': '#E4DDD2', 'adm-rule': '#D8CFC2',
'adm-ink': '#141418', 'adm-ink-muted': '#5C5448', 'adm-ink-faint': '#8A8170',
'adm-primary': '#8B4A36', 'adm-primary-soft': '#E8D5CC',
'adm-cat-terracota': '#C55C3E', 'adm-cat-azul-tinta': '#3458A2',
'adm-cat-oliva': '#5F7436', 'adm-cat-ocre': '#C49838', 'adm-cat-vinho': '#8C344C',
```
> Confirme os hex reais lendo o `tailwind.config.mjs`/`global.css`/`admin.css` do scaffold; os acima são derivados do DESIGN.md do scaffold (OKLCH→hex aproximado). Use os reais se divergirem.

## Passo 5 — Build verde

```bash
cd /c/Projects/clinify && bun run build
```
Resolva erros de import/caminho (profundidade relativa pode divergir). Erros comuns:
- import quebrado de helper → confirme que o helper foi copiado (passo 2 lib closure).
- `astro:content` em editor de post → o clinify tem `content.config.ts` próprio (coleção `blog` com schema de clínica); o PostsManager do scaffold pode reclamar de campos. **Se um editor de blog quebrar o build contra os dados da clínica, stube esse arquivo** (não mexa no content.config da clínica) e anote — é blog, será podado depois.
- `@tailwindcss/typography` se algum admin usar `prose`.

Repita até `bun run build` verde. Rode também `bun run test` (deve seguir 8/8 — frontend intocado).

## Passo 6 — Verificação (e2e dev)

```bash
cd /c/Projects/clinify && (bun run dev >/tmp/cli-dev.log 2>&1 &) && sleep 6
PORT=$(grep -oE 'localhost:[0-9]+' /tmp/cli-dev.log | head -1 | cut -d: -f2)
curl -s -c /tmp/ck.txt -o /dev/null -w "login:%{http_code}\n" -X POST http://localhost:$PORT/api/admin/login -H 'Content-Type: application/json' -d '{"password":"123456"}'
# dashboard real do scaffold renderiza?
curl -s -b /tmp/ck.txt http://localhost:$PORT/admin -o /tmp/admin.html
# frontend da clínica intocado?
curl -s http://localhost:$PORT/ | grep -o "Um sorriso saudável" | head -1
curl -s http://localhost:$PORT/servicos | grep -o "Serviços odontológicos" | head -1
```
Confirme (use Grep tool no /tmp/admin.html se o rtk mangear o grep do Bash):
- `/admin` agora mostra o DASHBOARD do scaffold (não o painel de 2 links) — itens de nav: Artigos, Categorias, Autores, Menu, Sobre, Contato, Plugins, Configurações, etc.
- HTML do admin tem classes `adm-*` (com cor), não classes custom sem namespace.
- Frontend da clínica (`/`, `/servicos`, `/blog`) renderiza igual a antes.

Mate o dev server no fim.

## Critério de pronto
- [ ] `/admin` renderiza IDÊNTICO ao admin do scaffold (dashboard + nav completa com seções de blog e site, look Café-da-Tarde)
- [ ] Tokens do admin namespaced (`adm-*`); grep limpo de tokens custom sem namespace em arquivos de admin
- [ ] `tailwind.config.mjs`: só ADIÇÃO de `adm-*`; tokens da clínica intactos
- [ ] Frontend da clínica INTOCADO e buildando: `/`, `/servicos`, `/equipe`, `/sobre`, `/contato`, `/agendar`, `/blog` iguais a antes
- [ ] `bun run build` verde; `bun run test` 8/8
- [ ] Nenhum arquivo do GUARD-RAIL tocado (confirme com `git diff --name-only` que o frontend não aparece)

## Reporte
Liste: deps adicionadas, nº de arquivos copiados, arquivos de blog stubados (se houver) e por quê, saída do build/test, e a evidência de que (a) /admin mostra o dashboard real e (b) o frontend da clínica não mudou. Cole evidência real. Se não conseguir build verde sem tocar no frontend, PARE e reporte o bloqueio — não viole o guard-rail.
</content>
