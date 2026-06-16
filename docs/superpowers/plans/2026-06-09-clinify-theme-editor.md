# Clinify — ThemeEditor no CMS (1º prop editável) Plan

> **For agentic workers:** Use superpowers:executing-plans. Branch: `cms-scaffold-completo`.

**Goal:** Tornar o TEMA editável dentro do CMS embarcado — escolher a especialidade (preset) e ajustar as cores, salvando `src/data/theme.json` via o endpoint `github.ts`. É o primeiro prop a virar editável; os demais (siteConfig, blocos, páginas) vêm depois.

**Architecture:** Editor React (`ThemeEditor.tsx`) no padrão dos editores do scaffold (`githubApi('read'/'write')`). Lê `theme.json` (`{preset, overrides}`) + as cores-base do preset (`src/data/themes/<preset>.json`). Salva → `theme.json` → `resolveTheme()` (já existe) injeta no `ThemeStyle` → site re-tematizado (dev: na hora; prod: após publish/rebuild). Estilo do editor usa os tokens `adm-*` (admin namespaced), pra casar com o admin embarcado.

**Guard-rail:** NÃO tocar no frontend da clínica nem no `theme.ts`/`themes/*`/`global.css`/`tailwind.config` da clínica. O editor só LÊ/ESCREVE `theme.json` via API. Só adiciona: `ThemeEditor.tsx`, `tema.astro`, e 1 link no `AdminNav.tsx`.

---

### Task 0: Commitar o embed do CMS (checkpoint)

- [ ] **Step 1** — `cd /c/Projects/clinify && git add -A && git commit -m "feat(cms): embarca admin do scaffold completo (idêntico, sem poda) + namespace adm-"`
- [ ] **Step 2** — `git log --oneline | head -3` (confirma o commit)

---

### Task 1: `ThemeEditor.tsx`

**Files:** Create `src/components/admin/ThemeEditor.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
import { useEffect, useState } from 'react';
import { githubApi } from '../../lib/adminApi';
import { triggerToast } from './CmsToaster';

// Especialidades = presets em src/data/themes/<slug>.json
const PRESETS = [
  { slug: 'dental', label: 'Odontologia (azul/âmbar)' },
  { slug: 'harmonizacao', label: 'Harmonização (nude/rosé)' },
];

const TOKEN_LABELS: Record<string, string> = {
  primary: 'Cor principal (marca)',
  secondary: 'Cor secundária',
  accent: 'Destaque (botões/CTA)',
  'accent-ink': 'Texto sobre o destaque',
  bg: 'Fundo da página',
  surface: 'Cartões',
  soft: 'Fundo de seção',
  ink: 'Texto principal',
  'ink-muted': 'Texto secundário',
  border: 'Bordas',
};

interface ThemeConfig {
  preset: string;
  overrides?: { colors?: Record<string, string>; fonts?: { display?: string; body?: string } };
}

export default function ThemeEditor() {
  const [cfg, setCfg] = useState<ThemeConfig>({ preset: 'dental', overrides: { colors: {} } });
  const [base, setBase] = useState<Record<string, string>>({});
  const [sha, setSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    githubApi('read', 'src/data/theme.json')
      .then((d: any) => {
        const parsed = JSON.parse(d?.content || '{}');
        setCfg({ preset: parsed.preset || 'dental', overrides: parsed.overrides || { colors: {} } });
        setSha(d?.sha);
      })
      .catch((e: any) => setError(e?.message || 'Erro ao carregar o tema'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!cfg.preset) return;
    githubApi('read', `src/data/themes/${cfg.preset}.json`)
      .then((d: any) => { const p = JSON.parse(d?.content || '{}'); setBase(p.colors || {}); })
      .catch(() => setBase({}));
  }, [cfg.preset]);

  const overrides = cfg.overrides?.colors || {};
  const valueFor = (t: string) => overrides[t] ?? base[t] ?? '#000000';

  const setPreset = (preset: string) =>
    setCfg((c) => ({ ...c, preset, overrides: { ...(c.overrides || {}), colors: {} } }));
  const setColor = (t: string, hex: string) =>
    setCfg((c) => ({ ...c, overrides: { ...(c.overrides || {}), colors: { ...(c.overrides?.colors || {}), [t]: hex } } }));
  const resetOverrides = () => setCfg((c) => ({ ...c, overrides: { ...(c.overrides || {}), colors: {} } }));

  const save = async () => {
    setSaving(true);
    try {
      const res: any = await githubApi('write', 'src/data/theme.json', {
        content: JSON.stringify(cfg, null, 2),
        sha,
        message: 'CMS: tema do site',
      });
      setSha(res?.sha);
      triggerToast('Tema salvo! Publique para aplicar no site.', 'success');
    } catch (e: any) {
      triggerToast(e?.message || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-adm-ink-muted">Carregando…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const tokens = Object.keys(base).length ? Object.keys(base) : Object.keys(TOKEN_LABELS);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-adm-ink mb-1">Tema do site</h1>
      <p className="text-adm-ink-muted text-sm mb-6">Escolha a especialidade e ajuste as cores. Salve e publique para aplicar no site.</p>

      <label className="block mb-6">
        <span className="block text-sm font-semibold text-adm-ink mb-1">Especialidade (paleta base)</span>
        <select value={cfg.preset} onChange={(e) => setPreset(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-adm-border bg-adm-surface text-adm-ink">
          {PRESETS.map((p) => <option key={p.slug} value={p.slug}>{p.label}</option>)}
        </select>
      </label>

      <div className="space-y-1">
        {tokens.map((t) => (
          <label key={t} className="flex items-center justify-between gap-4 py-2 border-b border-adm-border">
            <span className="text-sm text-adm-ink">{TOKEN_LABELS[t] || t}</span>
            <span className="flex items-center gap-2">
              <input type="color" value={valueFor(t)} onChange={(e) => setColor(t, e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-adm-border" />
              <input type="text" value={valueFor(t)} onChange={(e) => setColor(t, e.target.value)} className="w-24 px-2 py-1 text-sm rounded border border-adm-border bg-adm-surface font-mono text-adm-ink" />
            </span>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button onClick={save} disabled={saving} className="px-6 py-3 rounded-full bg-adm-primary text-white font-semibold disabled:opacity-50">
          {saving ? 'Salvando…' : 'Salvar tema'}
        </button>
        <button onClick={resetOverrides} className="px-4 py-3 rounded-full border border-adm-border text-adm-ink text-sm">
          Restaurar cores do preset
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar** — `bun run build` → PASS.

---

### Task 2: `tema.astro`

**Files:** Create `src/pages/admin/tema.astro`

```astro
---
export const prerender = false;
import AdminLayout from '../../layouts/AdminLayout.astro';
import ThemeEditor from '../../components/admin/ThemeEditor';
---
<AdminLayout title="Tema" activeSection="tema">
  <ThemeEditor client:load />
</AdminLayout>
```

- [ ] **Verificar** — `bun run build` → PASS.

---

### Task 3: Link "Tema" no AdminNav

**Files:** Modify `src/components/admin/AdminNav.tsx`

- [ ] **Step 1:** Ler o `AdminNav.tsx` (é o do scaffold, com helpers `NavLink`/`SubNavLink` e grupos). Adicionar um item de navegação **"Tema do site"** apontando pra `/admin/tema`, com a key de seção ativa `tema`, seguindo EXATAMENTE o padrão dos itens existentes (mesmo componente helper, mesma estrutura). Coloque no grupo "Páginas" (ou crie um grupo "Aparência" se preferir, no mesmo padrão). Use um ícone do `lucide-react` já importado ou importe `Palette`.

> Não reescreva o AdminNav — só insira o item novo no padrão existente.

- [ ] **Step 2: Verificar** — `bun run build` → PASS.

---

### Task 4: Verificação e2e + commit

- [ ] **Step 1: dev + provar o save do tema**

```bash
cd /c/Projects/clinify && (bun run dev >/tmp/cli-dev.log 2>&1 &) && sleep 7
PORT=$(grep -oE 'localhost:[0-9]+' /tmp/cli-dev.log | head -1 | cut -d: -f2); echo "porta: $PORT"
curl -s -c /tmp/ck.txt -o /dev/null -w "login:%{http_code}\n" -X POST http://localhost:$PORT/api/admin/login -H 'Content-Type: application/json' -d '{"password":"123456"}'
# a página do editor renderiza?
curl -s -b /tmp/ck.txt http://localhost:$PORT/admin/tema -o /tmp/tema.html -w "tema:%{http_code}\n"
# salvar um theme.json com primary mudado, via o endpoint real
SHA=$(curl -s -b /tmp/ck.txt -X POST http://localhost:$PORT/api/admin/github -H 'Content-Type: application/json' -d '{"action":"read","path":"src/data/theme.json"}' | grep -oE '"sha":"[^"]*"' | head -1 | cut -d'"' -f4)
curl -s -b /tmp/ck.txt -X POST http://localhost:$PORT/api/admin/github -H 'Content-Type: application/json' \
  -d "{\"action\":\"write\",\"path\":\"src/data/theme.json\",\"content\":\"{\\\"preset\\\":\\\"dental\\\",\\\"overrides\\\":{\\\"colors\\\":{\\\"primary\\\":\\\"#123456\\\"}}}\",\"sha\":\"$SHA\",\"message\":\"teste tema\"}" -o /dev/null -w "write:%{http_code}\n"
# o site reflete? (dev re-resolve o tema)
curl -s http://localhost:$PORT/ | grep -o "#123456" | head -1
```
Expected: `login:200`; `tema:200`; `write:200`; o `grep` acha `#123456` no `<style>` injetado da home → **o tema editado no CMS reflete no site**.

- [ ] **Step 2: Reverter o teste + matar dev**

```bash
cd /c/Projects/clinify && git checkout src/data/theme.json
(netstat -ano 2>/dev/null | grep ":$PORT" | grep LISTENING | awk '{print $5}' | sort -u | while read pid; do taskkill //PID $pid //F 2>/dev/null; done); pkill -f "astro dev" 2>/dev/null
bun run build 2>&1 | tail -2
```

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(cms): ThemeEditor — tema editável no admin (preset + cores)"`

---

## Critério de pronto
- [ ] `/admin/tema` carrega o editor: dropdown de especialidade + color pickers por token
- [ ] Salvar grava `theme.json` (`{preset, overrides}`) via `github.ts` — testado e2e
- [ ] Mudar uma cor no CMS reflete no `<style>` do site (dev) — testado
- [ ] "Tema do site" aparece no AdminNav
- [ ] `bun run build` verde; frontend da clínica e tema (`theme.ts`/`themes/*`) intocados
- [ ] Embed do CMS commitado como checkpoint

## Próximo (mapear o resto das props)
siteConfig (dados da clínica), `page.json` (conteúdo dos 11 blocos da home + composição), as 5 páginas (`src/data/pages/*.json`) e os posts. Cada um vira 1 editor no mesmo padrão (`githubApi`) + página admin + link no nav. Candidato a usar o agente `walker-cms-builder` (gera editores clonando o padrão ConfigEditor) pro volume.
</content>
