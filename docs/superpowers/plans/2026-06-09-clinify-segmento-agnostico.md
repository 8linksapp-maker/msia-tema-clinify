# Clinify — Desacoplar do "dentista" → template médico universal Plan

> Use superpowers:executing-plans. Branch: `cms-scaffold-completo`.

**Goal:** Remover os 4 acoplamentos hardcoded ao nicho odontológico, e tornar o **segmento editável no CMS**, pra o clinify virar template de QUALQUER nicho médico (derma, fisio, oftalmo, vet…) só editando.

**Auditoria (o que está preso):** (1) schema `@type:"Dentist"` fixo; (2) copies "sorriso"/"saúde bucal" em 2 arquivos; (3) presets do tema hardcoded no ThemeEditor; (4) hint `/dentista/` errado no LocaisEditor.

**Guard-rail:** NÃO mexer no visual/layout (cores/tema/blocos). Só schema, copies, config e os dois editores citados. `bun run build` verde + `bun run test` 8/8.

---

### Task 1: siteConfig — campos de segmento

**Files:** Modify `src/data/siteConfig.json`

- [ ] Adicionar (mantendo os campos existentes):
```json
"segmento": "Odontologia",
"schemaType": "Dentist"
```
(default preserva o comportamento atual; pra outro nicho, troca esses dois.)

---

### Task 2: Schema `@type` dirigido pelo config

**Files:** Modify `src/components/local/LocalBusinessSchema.astro`

- [ ] Trocar o `@type` fixo por config-driven:
```astro
// no frontmatter, antes do objeto schema:
const tipo = (site as any).schemaType || 'MedicalBusiness';
// no objeto:
'@type': tipo,
```
(Remove o `'@type': 'Dentist'` hardcoded. Default genérico `MedicalBusiness` se ausente; o siteConfig atual traz `Dentist`.)

---

### Task 3: De-hardcode das copies

**Files:** Modify `src/pages/[local]/[servico].astro`, `src/pages/blog/index.astro`

- [ ] `src/pages/[local]/[servico].astro` — a seção Notícias:
  DE: `<Novidades eyebrow="Notícias" title="Conteúdo para o seu sorriso" />`
  PARA: `<Novidades eyebrow="Notícias" title="Conteúdo e novidades" />`

- [ ] `src/pages/blog/index.astro` — usar `siteConfig.name` e copy neutra:
  - Garantir import do siteConfig: `import site from '../../data/siteConfig.json';`
  - `<BaseLayout title={`Novidades — ${site.name}`} description={`Artigos, dicas e novidades da ${site.name}.`}>`
  - H1: `<h1 class="text-4xl md:text-5xl">Artigos e novidades</h1>`
  (remove "Clínica Sorriso"/"saúde bucal"/"sorriso" hardcoded.)

---

### Task 4: ThemeEditor — presets data-driven

**Files:** Modify `src/components/admin/ThemeEditor.tsx`

- [ ] Substituir o array `PRESETS` hardcoded por leitura dos arquivos `src/data/themes/*.json` via `import.meta.glob` (Vite suporta em componente client):
```tsx
const themeModules: Record<string, any> = import.meta.glob('../../data/themes/*.json', { eager: true });
const PRESETS = Object.entries(themeModules)
  .map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace('.json', '');
    const data = (mod as any).default ?? mod;
    return { slug, label: data?.name || slug };
  })
  .sort((a, b) => a.label.localeCompare(b.label));
```
Assim, adicionar `themes/dermatologia.json` faz o preset aparecer no dropdown automaticamente — sem editar código.

---

### Task 5: LocaisEditor — corrigir o hint de URL

**Files:** Modify `src/components/admin/LocaisEditor.tsx`

- [ ] O hint mostra `/dentista/{slug}`, que está ERRADO (a URL real da matriz é `/{localidade}/{serviço}`). Corrigir pra refletir que a localidade é o 1º segmento:
  - O prefixo visual (linha ~277) deixa de ser `/dentista/` → vira `/` (e o slug é a localidade).
  - O texto "URL final" (linha ~288) → `URL das páginas: /{item.slug || '...'}/<serviço>`
  (sem nicho hardcoded; reflete a estrutura real.)

---

### Task 6: SiteConfigEditor — campo "Segmento" editável

**Files:** Modify `src/components/admin/SiteConfigEditor.tsx`

- [ ] Adicionar um grupo "Segmento / Tipo de negócio" com 2 campos que gravam no siteConfig:
  - `segmento` — input de texto (ex: "Odontologia", "Dermatologia", "Fisioterapia").
  - `schemaType` — `<select>` com opções (valor = schema.org type): `MedicalBusiness` (Genérico), `Dentist` (Odontologia), `Physician` (Médico/Clínica), `Optician` (Ótica/Oftalmo), `Pharmacy` (Farmácia), `VeterinaryCare` (Veterinária), `Hospital` (Hospital).
  - Seguir o padrão dos outros campos do SiteConfigEditor (tokens `adm-*`, `setData`/`set`). Persistir junto no `siteConfig.json` via o `githubApi('write')` já usado.

> Assim o usuário escolhe o segmento no painel; o schema `@type` (Task 2) passa a refletir isso, e o site "pertence" ao nicho escolhido.

---

### Task 7: Verificação + commit

- [ ] `bun run build` verde; `bun run test` 8/8.
- [ ] Schema dirigido: com `schemaType:"Dentist"` → `"@type":"Dentist"` numa página da matriz; trocar pra `"Physician"` (node) → rebuild → `"@type":"Physician"`; **reverter pra "Dentist"**.
- [ ] Copies: "sorriso"/"saúde bucal" NÃO aparecem mais em `dist/client/blog/index.html` nem na seção Notícias da matriz (Grep tool → 0 nessas strings hardcoded; conteúdo seed dos posts .md pode manter, é dado editável).
- [ ] Presets data-driven: ThemeEditor lista os themes de `src/data/themes/` (com `dental` e `harmonizacao` no dropdown). Login 123456 → `/admin/tema` 200.
- [ ] Hint do LocaisEditor não mostra mais `/dentista/`.
- [ ] SiteConfigEditor (`/admin/dados-clinica`) mostra o campo Segmento + select de tipo.
- [ ] Visual/tema intocado (git diff não mostra global.css/theme.ts/themes/tailwind).
- [ ] Commit: `git add -A && git commit -m "feat(segmento): desacopla do nicho odonto — schema/copies/presets data-driven + segmento editável"`

## Critério de pronto
- [ ] `@type` do schema vem de `siteConfig.schemaType` (editável no painel)
- [ ] Sem copy hardcoded de "sorriso/saúde bucal" nos componentes/páginas (só nos dados seed)
- [ ] Presets do tema lidos de `themes/*.json` (adicionar nicho = adicionar JSON)
- [ ] Hint do LocaisEditor correto (sem `/dentista/`)
- [ ] Campo Segmento editável no SiteConfigEditor
- [ ] Build verde, test 8/8, visual intocado

## Nota
Trocar de nicho de verdade (ex: virar dermatologia) = no painel: schemaType + segmento + nome/contato + serviços + localidades + tema (preset) + copy dos blocos + imagens. Tudo editável após este passo. Conteúdo seed (posts .md, textos de exemplo) é substituível pelo cliente.
</content>
