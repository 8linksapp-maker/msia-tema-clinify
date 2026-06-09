# Clinify — Template multi-especialidade para clínicas

**Data:** 2026-06-09
**Autor:** Genilson (Tech Lead) + Bruno
**Status:** Aprovado — pronto pra plano de implementação
**Produto:** template de site alugável na plataforma `meu-site-com-ia` (MSIA)

---

## 1. Objetivo

Construir um **template de site para clínicas** que seja **multi-especialidade**:
um único codebase que se adapta a dentista, cirurgia, harmonização facial e
qualquer nicho clínico **trocando um preset de tema** (cores + tipografia), sem
editar código. Cada clínica que aluga compõe a própria página escolhendo e
ordenando blocos.

Entrega de hoje: **Front-End + Back-End** (CMS + captura de lead).

## 2. Base técnica e estratégia de montagem

**Ordem de montagem (decisão do Bruno):** NÃO é fork-e-arranca-blog. É o
pipeline de dois estágios:

1. **Construir o tema da clínica primeiro, standalone** em `C:\Projects\clinify`
   — Astro 5.1 + Tailwind 3 + Bun, fiel ao Dentaire, com a camada tokens+blocos.
   O frontend nasce limpo, sem o legado de blog do scaffold.
2. **Clonar o `msia-scaffold` e embarcar o CMS dele por cima do tema novo**
   (overlay): admin (ilhas React), `middleware.ts` + auth, `lib/` (readData,
   repoAtomicCommit, repoIo), plugins, captura de lead. Depois o **data-wiring**:
   os blocos passam a ler de `readData()` e o form posta no `/api/subscribe`.

Ou seja: **frontend fiel ao Dentaire primeiro; CMS embarcado depois.** Mesma
mecânica do `/clone` (tema standalone) → `plug-walker`/`walker-integrator`
(overlay do CMS + wiring), só que manual.

Stack final: Astro 5.1 (static híbrido + adapter Vercel), React 18 só nas ilhas
do admin, Tailwind 3, Bun.

**Embarcado do scaffold (não rebuildar):**
- CMS embarcado: admin em ilhas React, auth via `middleware.ts` + `ADMIN_SECRET`
- Persistência: `lib/repoAtomicCommit.ts` (GitHub Tree API em prod, fs em dev)
- Captura de lead: endpoint `/api/subscribe` → `subscribers.json` + painel de leads
- 14 plugins + sistema de slots (`plugins/_slots/`)
- `lib/readData.ts`, deploy Vercel, build híbrido

**NÃO embarcado (fica no scaffold, não vem pro tema novo):**
- Frontend "post = porta colorida" (`index.astro`, seções `Section1Hero`…) — o
  tema da clínica é construído do zero no estágio 1
- Tema hardcoded Café-da-Tarde em `global.css` + `tailwind.config` — substituído
  pela camada de tokens do Dentaire
- Sistema de 5 cores de categoria (DNA do blog MSIA, não de clínica)

**Embarcado com reframe:**
- Blog (`content/blog`, `[slug].astro`, `/blog`) vira **"Novidades/Artigos"** da
  clínica. Reaproveita os plugins de SEO. Os templates de post/listagem são
  reestilizados com os tokens do tema (não as cores de categoria).

## 3. Arquitetura

Modelo escolhido: **tokens + blocos** (theming por design tokens + blocos de
seção plugáveis).

### 3.1 Theme system (camada "tokens")

- Nomes de token semânticos ficam **estáveis** (`bg`, `surface`, `ink`,
  `ink-muted`, `primary`, `secondary`, `accent`, `border`, `soft`…). O Tailwind
  continua lendo `rgb(var(--token))` / `var(--token)`.
- Os **valores** viram preset trocável em `src/data/themes/<especialidade>.json`.
  Cada preset carrega **cores + tipografia** (font family).
- `src/data/theme.json` (por clínica) referencia um preset + overrides opcionais
  (ex: trocar só `primary`).
- O `BaseLayout.astro` injeta `<style>:root{ --bg:…; --primary:… }</style>` do
  preset selecionado, resolvendo preset + overrides.
- **Resultado:** trocar de especialidade = trocar 1 string em `theme.json`. Zero
  componente tocado.

Requer refatorar `global.css` para que **todos** os tokens themeáveis venham de
CSS var (parte já vem). Tokens de tipografia (`--font-display`, `--font-body`)
idem.

#### Preset default `dental.json` (extraído do Dentaire — fonte da verdade visual)

Referência: https://html.awaikenthemes.com/dentaire/

| Token | Valor | Papel |
|---|---|---|
| `primary` | `#0E384C` | petróleo/teal profundo (marca, headings escuros) |
| `accent` | `#FFA800` | âmbar dourado (CTA, destaques) |
| `secondary` | `#1E84B5` | azul clínico |
| `ink-muted` | `#527282` | slate-azulado (texto secundário) |
| `soft` | `#EFF8FF` | azul-gelo (fundos de seção) |
| `bg` | `#FFFFFF` | fundo |
| `ink` | `#0E384C` | texto primário (mesmo petróleo do primary, escuro) |
| `font-display` / `font-body` | `Poppins` (100–800) | tipografia |

Estilo: moderno, clean, cards arredondados, muito whitespace, clínico-acolhedor.

> **Nota:** o DESIGN.md do `msia-scaffold` (Café-da-Tarde, Fraunces+Karla,
> terracota, anti-refs próprios) **não se aplica** a clinify. Clinify ganha seu
> próprio `DESIGN.md` baseado no Dentaire.

### 3.2 Block system (camada "blocos")

A home vira composição declarativa:

```jsonc
// src/data/page.json
{
  "blocks": [
    { "type": "hero",        "props": { "title": "…", "cta": {…}, "image": "…" } },
    { "type": "servicos",    "props": { "items": [...] } },
    { "type": "novidades",   "props": { "limit": 3 } }
  ]
}
```

- `src/blocks/registry.ts` mapeia `type → componente Astro`.
- `src/blocks/BlockRenderer.astro` percorre o array e monta. Tipo desconhecido →
  pula (graceful, não quebra build).
- Cada bloco é componente Astro **tipado** (`interface Props`), lê **só do
  `props`**, estiliza **só com tokens semânticos** (logo herda o tema).
- `src/pages/index.astro` vira ~10 linhas: lê `page.json` → `<BlockRenderer>`.

### 3.3 Data model (editável)

Novos arquivos em `src/data/`:

| Arquivo | Papel |
|---|---|
| `page.json` | composição de blocos da home |
| `theme.json` | preset selecionado + overrides |
| `themes/*.json` | presets de especialidade (`dental.json` no MVP) |

Dados de cada bloco moram **dentro do `props`** no `page.json`. Persistência via
`repoAtomicCommit` (já existe).

## 4. Lista de blocos (MVP — mapeada das seções do Dentaire)

| # | Bloco (`type`) | Conteúdo | Origem |
|---|---|---|---|
| 1 | `hero` | título, lead, CTA, badge avaliação, card do doutor, mini-card contato | Dentaire hero |
| 2 | `sobre` | 2-col, selo de experiência, lista de benefícios | About |
| 3 | `servicos` | grid de cards ícone+título+desc | Services |
| 4 | `numeros` | contadores (pacientes, anos, médicos) | Stats |
| 5 | `porqueEscolher` | 6 feature cards em volta de imagem | Why choose us |
| 6 | `comoFunciona` | 3 passos | How it works |
| 7 | `equipe` | cards de profissionais + social | Team |
| 8 | `depoimentos` | 3 cards + rating | Testimonials |
| 9 | `antesDepois` | galeria comparativa (slider) | **extra** — crítico p/ harmonização/cirurgia |
| 10 | `novidades` | 3 posts recentes | **reusa o blog** |
| 11 | `ctaContato` | faixa "consulta grátis" + dados + form de lead | Contact CTA |

Header e Footer são globais (layout), não blocos.

## 5. Fluxo de captura de lead

`ctaContato` (e formulário de contato) → `POST /api/subscribe` (já existe) →
`subscribers.json` → painel de leads do admin (já existe).

**Única extensão:** payload hoje é email-only; estender para
`{ nome, telefone, servico, mensagem }`. Mudança cirúrgica em `/api/subscribe`
+ no form. Painel de leads exibe os novos campos.

## 6. Admin

Editores React (ilhas) — **faseado**:

- **Fase 2:** `PageEditor.tsx` (compõe/reordena/edita blocos), `ThemeEditor.tsx`
  (escolhe preset + ajusta `primary`, com preview).
- Reusa `ConfigEditor` (dados da clínica), `PostEditor`/`PostsManager` (blog).

## 7. Faseamento do MVP

- **Fase 1 (foco de hoje):** theme system + 11 blocos renderizando de `page.json`
  + lead funcionando + 1 preset (`dental`). **Site completo no ar, editável via
  JSON.** Admin de conteúdo de clínica ainda não-visual.
- **Fase 2:** `PageEditor` + `ThemeEditor` visuais + presets extras
  (harmonização, cirurgia, clínica-geral).

## 8. Critério de pronto (Fase 1)

- [ ] `bun run dev` sobe; home renderiza os 11 blocos de `page.json`
- [ ] Trocar `theme.json` (`dental` → outro preset stub) muda a paleta **inteira
      sem tocar componente**
- [ ] Formulário de contato cria lead em `subscribers.json` e aparece no painel
- [ ] Blog (`/blog`, posts) continua funcionando como "Novidades"
- [ ] `bun run build` passa sem erro
- [ ] Visual fiel ao Dentaire (paleta petróleo+âmbar, Poppins, cards arredondados)

## 9. Sequência de build (dois estágios)

### Estágio 1 — Tema standalone (frontend fiel ao Dentaire)

```
1.1 Scaffold limpo   → Astro 5.1 + Tailwind 3 + Bun em clinify/ (bun create)
1.2 Theme system     → tokens semânticos via CSS var + themes/dental.json
                       + injeção no layout + Poppins
1.3 DESIGN.md        → tokens Dentaire documentados            (paralelo a 1.2)
1.4 Block registry   → src/blocks/ + BlockRenderer + index lê page.json (dep 1.2)
1.5 Blocos 1-11      → componentes Astro fiéis ao Dentaire     (dep 1.4, agrupável)
```
Fim do estágio 1: site da clínica no ar, standalone, dados hardcoded em
`page.json`, visual idêntico ao Dentaire, troca de tema funcionando.

### Estágio 2 — Embarcar o CMS (overlay + wiring)

```
2.1 Clonar scaffold  → trazer admin, middleware, lib/, plugins, api/ pro clinify
2.2 Overlay CMS      → admin + auth + persistência funcionando sobre o tema
2.3 Data-wiring      → blocos passam a ler readData(); page.json/theme.json
                       persistidos via repoAtomicCommit
2.4 Lead wiring      → form do ctaContato → /api/subscribe (estendido) → painel
2.5 Blog reframe     → /blog reestilizado com tokens do tema (Novidades)
2.6 Build verde      → bun run build passa; deploy Vercel
```

Regra de paralelismo (hardware Bruno, max 3 chunks): no estágio 1, os blocos
(1.5) podem ser agrupados, mas **nenhum grupo toca a config de tema, o
`tailwind.config` ou `page.json` ao mesmo tempo** — pontos de serialização.

## 10. Decisões tomadas (não revisitar sem motivo)

- **Abordagem A** (block registry + theme presets reusando CMS), não schema-driven
  (Abordagem B fica como evolução natural da Fase 2).
- **Blog mantido** como "Novidades" (vale SEO que a plataforma vende).
- **Café-da-Tarde descartado** no frontend de clínica; clinify tem DESIGN próprio.
- **`antesDepois`** incluído fora do set Dentaire (crítico p/ nichos do Bruno).
- **Admin visual faseado** pra Fase 2; Fase 1 entrega site editável por JSON.
- **Ordem de montagem invertida** (decisão Bruno): tema standalone PRIMEIRO
  (estágio 1), depois clonar o scaffold e embarcar o CMS por cima (estágio 2).
  Não é fork-do-scaffold-e-arranca-blog.

## 11. Em aberto (resolver no plano)

- Quantidade de presets stub na Fase 1 (mínimo: `dental` real + 1 stub pra provar
  a troca de tema).
- Slider de `antesDepois`: reusar `swiper` (Dentaire usa) ou solução leve própria.
- Onde mora a lista de serviços/equipe: inline no `page.json` (MVP) vs coleção
  dedicada (se precisar reuso entre páginas) — MVP fica inline.
</content>
</invoke>
