# Clinify — Tópicos como cabeçalho (H2–H4) + conteúdo Plan

> Use superpowers:executing-plans. Branch: `cms-scaffold-completo`.

**Goal:** Evoluir os tópicos por serviço: cada tópico deixa de ser uma string e vira `{ nivel: H2|H3|H4, titulo, conteudo }`. No `/admin/servicos`: seletor de nível + título + área de conteúdo (Markdown). Na página da matriz: o cabeçalho sai na tag do nível escolhido + o conteúdo renderizado. **Hero continua o único H1** (níveis disponíveis: H2, H3, H4).

**Guard-rail:** NÃO mexer no visual dos blocos, `global.css`, `theme.ts`, `themes/`, `tailwind.config`. No `[slug].astro` só ALTERA a seção de tópicos do ramo `kind==='local'`. Reusa a classe `.prose-clinic` (já existe) pro conteúdo. `bun run build` verde + `bun run test` 8/8.

> **Nota SEO (anti-doorway):** o `conteudo` do tópico é por-serviço, logo se repete em todas as localidades daquele serviço. O conteúdo único por localidade segue sendo `referenciaLocal`/`bairrosVizinhos`/`faq`. Manter o conteúdo de tópico enxuto ou contextualizar depois evita doorway.

---

### Task 1: Schema — tópico vira objeto

**Files:** Modify `src/lib/schemas/servicos.ts`

- [ ] Trocar `topicos` por array de objeto:
```ts
const topicoSchema = z.object({
  nivel: z.enum(['h2', 'h3', 'h4']).default('h2'),
  titulo: z.string(),
  conteudo: z.string().default(''),
});
// no servicoItemSchema:
topicos: z.array(topicoSchema).default([]),
```

---

### Task 2: Dados — converter os tópicos dos 9 serviços

**Files:** Modify `src/data/servicos.json`

- [ ] Converter cada `topicos` de array de strings pra array de objetos. Cada título vira `{ "nivel": "h2", "titulo": "<o título atual>", "conteudo": "" }`. Ex (implante):
```json
"topicos": [
  { "nivel": "h2", "titulo": "O que é o implante dentário", "conteudo": "" },
  { "nivel": "h2", "titulo": "Quando o implante é indicado", "conteudo": "" },
  { "nivel": "h2", "titulo": "Como é feito o procedimento", "conteudo": "" },
  { "nivel": "h2", "titulo": "Recuperação e cuidados", "conteudo": "" },
  { "nivel": "h2", "titulo": "Quanto custa um implante", "conteudo": "" }
]
```
Mesmo padrão pros 9 serviços (mantém os títulos que já existem; `nivel:"h2"`, `conteudo:""`).

---

### Task 3: Editor — nível + título + conteúdo por tópico

**Files:** Modify `src/components/admin/ServicosEditor.tsx`

- [ ] Cada item de tópico passa a ser objeto `{ nivel, titulo, conteudo }`. **Normalizar no load:** se vier string → `{ nivel:'h2', titulo:<string>, conteudo:'' }`; se objeto → garantir defaults (`nivel||'h2'`, `titulo||''`, `conteudo||''`).
- [ ] UI por tópico (no lugar do input único atual):
  - `<select>` de nível com opções **H2 / H3 / H4** (não oferecer H1).
  - input de **título**.
  - `<textarea>` de **conteúdo** (Markdown), algumas linhas de altura.
  - botão remover. Botão "Adicionar tópico" cria `{ nivel:'h2', titulo:'', conteudo:'' }`.
- [ ] Tokens `adm-*`. Persiste no `servicos.json` via o `githubApi('write')` já usado. Helpers `updateTopico(i, campo, valor)`.

---

### Task 4: Render — tag dinâmica + conteúdo Markdown

**Files:** Modify `src/pages/[slug].astro`

- [ ] No frontmatter, importar marked: `import { marked } from 'marked';`
- [ ] Substituir a seção de tópicos atual (ramo `kind==='local'`) por:

```astro
{props.servico.topicos?.length > 0 && (
  <section class="section">
    <div class="container-x max-w-3xl">
      <span class="eyebrow">Guia completo</span>
      <h2 class="text-3xl">{props.servico.nome} {props.local.prep || 'em'} {props.local.nome}: o que você precisa saber</h2>
      <div class="mt-8 space-y-8">
        {props.servico.topicos.map((t: any) => {
          const item = typeof t === 'string' ? { nivel: 'h2', titulo: t, conteudo: '' } : t;
          const Heading: any = ['h2', 'h3', 'h4'].includes(item.nivel) ? item.nivel : 'h2';
          const size = item.nivel === 'h3' ? 'text-xl' : item.nivel === 'h4' ? 'text-lg' : 'text-2xl';
          return (
            <div>
              <Heading class={`${size} text-ink font-display font-semibold`}>{item.titulo}</Heading>
              {item.conteudo && <div class="prose-clinic mt-2" set:html={marked.parse(item.conteudo)} />}
            </div>
          );
        })}
      </div>
    </div>
  </section>
)}
```

> `const Heading: any = item.nivel` + `<Heading>` é o padrão de **tag dinâmica** do Astro (variável capitalizada com string de tag HTML). `marked.parse` (marked já está instalado) renderiza o Markdown. Se TS reclamar, caste com `any`.

---

### Task 5: Verificação + commit

- [ ] `bun run build` verde; `bun run test` 8/8.
- [ ] Numa página da matriz, os títulos de tópico ainda saem como cabeçalho: Grep tool por `>O que é o implante dentário</h` em `dist/client/implante-dentario-em-pinheiros/index.html`.
- [ ] `/admin/servicos` (login 123456) renderiza o `<select>` de nível + textarea de conteúdo (procurar "H3"/"H4" e "conteúdo"/"Conteúdo" no bundle do ServicosEditor).
- [ ] Frontend antigo intocado (global.css/theme/tailwind/blocos sem diff).
- [ ] Commit: `git add -A && git commit -m "feat(local): tópicos com nível (H2-H4) + conteúdo Markdown editáveis no CMS"`

## Critério de pronto
- [ ] Tópico = `{nivel, titulo, conteudo}`; editor com seletor H2/H3/H4 + título + conteúdo Markdown
- [ ] Render usa a tag do nível escolhido + conteúdo Markdown; hero segue único H1
- [ ] Build verde, test 8/8, visual intocado
</content>
