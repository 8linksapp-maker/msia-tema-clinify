# Clinify — Tópicos por serviço (roteiro da página) Plan

> Use superpowers:executing-plans. Branch: `cms-scaffold-completo`.

**Goal:** Cada serviço passa a ter uma lista de **tópicos** (títulos) a serem abordados. Editáveis no `/admin/servicos`. Na página da matriz (serviço×localidade) os tópicos viram os **H2** (estrutura/roteiro SEO). O texto único de cada tópico, por página, é escrito depois (blog-post) — anti-doorway: nada de conteúdo idêntico entre localidades agora.

**Escopo:** 4 mudanças — schema + dado + editor + render. Pequeno e coeso.

**Guard-rail:** NÃO alterar o visual dos blocos, `global.css`, `theme.ts`, `themes/`, `tailwind.config`. A única mudança no frontend é ADICIONAR uma seção de tópicos no ramo `kind==='local'` do `[slug].astro`. O CMS (ServicosEditor) usa tokens `adm-*`. `bun run build` verde + `bun run test` 8/8.

---

### Task 1: Schema — campo `topicos`

**Files:** Modify `src/lib/schemas/servicos.ts`

- [ ] Adicionar `topicos` ao `servicoItemSchema`:
```ts
// dentro do z.object do item:
topicos: z.array(z.string()).default([]),
```

---

### Task 2: Dados — popular `topicos` nos 9 serviços

**Files:** Modify `src/data/servicos.json`

- [ ] Adicionar a chave `"topicos"` em cada serviço (mantendo slug/nome/resumo). Use exatamente:

```jsonc
// implante-dentario
"topicos": ["O que é o implante dentário", "Quando o implante é indicado", "Como é feito o procedimento", "Recuperação e cuidados", "Quanto custa um implante"]
// clareamento-dental
"topicos": ["Tipos de clareamento", "Clareamento a laser x caseiro", "Quanto tempo dura o resultado", "Cuidados após o clareamento", "É seguro para os dentes?"]
// ortodontia
"topicos": ["Aparelho fixo x alinhadores", "Quando usar aparelho", "Tempo de tratamento", "Manutenção e ajustes", "Cuidados com a higiene"]
// lentes-de-contato-dental
"topicos": ["O que são lentes de contato dental", "Lentes x facetas", "Como é a aplicação", "Durabilidade e manutenção", "Indicações e contraindicações"]
// tratamento-de-canal
"topicos": ["O que é tratamento de canal", "Quando o canal é necessário", "Como é o procedimento", "Dói fazer canal?", "Recuperação"]
// limpeza-e-prevencao
"topicos": ["O que inclui a limpeza profissional", "Com que frequência fazer", "Prevenção de cáries e gengivite", "Profilaxia x raspagem", "Cuidados em casa"]
// protese-dentaria
"topicos": ["Tipos de prótese", "Prótese fixa x removível", "Como é a adaptação", "Manutenção e durabilidade", "Quando a prótese é indicada"]
// odontopediatria
"topicos": ["Primeira consulta da criança", "Prevenção de cáries infantis", "Tratamentos mais comuns", "Como lidar com o medo do dentista", "Cuidados em casa"]
// urgencia-odontologica
"topicos": ["Quando procurar urgência", "Dor de dente: o que fazer", "Trauma e dente quebrado", "Atendimento no mesmo dia", "Como evitar emergências"]
```

---

### Task 3: Editor — lista de tópicos por serviço no ServicosEditor

**Files:** Modify `src/components/admin/ServicosEditor.tsx`

- [ ] No editor de cada serviço, adicionar um campo **"Tópicos abordados"**: lista de strings com add/remove por item, **no mesmo padrão do `bairrosVizinhos` do `LocaisEditor.tsx`** (input por item + botão remover + botão "adicionar tópico"). O estado do serviço passa a incluir `topicos: string[]` (default `[]` se vier sem). Ao salvar, persistir junto no `servicos.json` via o `githubApi('write', ...)` já usado. Estilo com tokens `adm-*`.

> Referência do padrão de lista-de-strings: ver como o `LocaisEditor.tsx` faz `bairrosVizinhos` (map com input + remover + adicionar).

---

### Task 4: Render — tópicos como H2 na página da matriz

**Files:** Modify `src/pages/[slug].astro`

- [ ] No ramo `kind === 'local'`, ADICIONAR uma seção de tópicos (depois da seção "Sobre/região", antes de "Como nos encontrar"). Cada tópico vira um H2; lead curto contextual à localidade (estrutura SEO agora, prosa única por página depois):

```astro
{props.servico.topicos?.length > 0 && (
  <section class="section">
    <div class="container-x max-w-3xl">
      <span class="eyebrow">Guia completo</span>
      <h2 class="text-3xl">{props.servico.nome} {props.local.prep || 'em'} {props.local.nome}: o que você precisa saber</h2>
      <div class="mt-8 space-y-10">
        {props.servico.topicos.map((t: string) => (
          <div>
            <h2 class="text-2xl text-ink">{t}</h2>
            <p class="mt-2 text-ink-muted">
              Tudo sobre {t.toLowerCase()} no atendimento de {props.servico.nome.toLowerCase()} {props.local.prep || 'em'} {props.local.nome}. {props.local.referenciaLocal}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
)}
```

> Observação: o `<p>` é um lead/placeholder contextualizado na localidade (não idêntico entre páginas). A prosa final e única por tópico/localidade entra depois via `blog-post`.

---

### Task 5: Verificação + commit

- [ ] `bun run build` verde; `bun run test` 8/8.
- [ ] Uma página da matriz mostra os H2 dos tópicos: `grep -o "O que é o implante dentário" dist/client/implante-dentario-em-pinheiros/index.html` (use Grep tool se o rtk mangear).
- [ ] `/admin/servicos` renderiza o campo de tópicos (login 123456 → 200, e o HTML tem "Tópicos abordados").
- [ ] Frontend antigo intocado (visual dos blocos/global.css/theme não mudaram).
- [ ] Commit: `git add -A && git commit -m "feat(local): tópicos por serviço (roteiro H2) editáveis no CMS"`

## Critério de pronto
- [ ] Cada serviço tem `topicos` editável em `/admin/servicos` (add/remove)
- [ ] Página da matriz renderiza os tópicos como H2 (estrutura SEO), com lead contextual à localidade
- [ ] Build verde, test 8/8, visual intocado
</content>
