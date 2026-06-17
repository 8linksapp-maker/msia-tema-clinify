# Clinify — Matriz: alinhar tópicos à esquerda + links nos serviços Plan

> Use superpowers:executing-plans. Branch: `cms-scaffold-completo`.

**Goal:** Na página da matriz (`/{local}/{servico}`): (1) alinhar a seção de tópicos à esquerda e remover a eyebrow "Guia completo"; (2) na seção "Tratamentos disponíveis" (bloco Servicos), cada card vira link pra página daquele serviço **na mesma localidade** (`/{local}/{servico.slug}`). Alinhar a FAQ junto (mesmo padrão).

**Causa do desalinhamento:** `container-x` já tem `mx-auto`; juntar `max-w-3xl` no mesmo div cria um bloco de 768px centralizado. Fix: `container-x` (full, com mx-auto) + um filho `max-w-3xl` (sem mx-auto) = coluna de leitura alinhada à esquerda.

**Guard-rail:** Pode editar `src/pages/[local]/[servico].astro` e `src/blocks/Servicos.astro` (adicionar suporte a link OPCIONAL por item — aditivo, não quebra o visual; usado na home/`/servicos` sem href, segue igual). NÃO mexer em `global.css`, `theme.ts`, `themes/`, `tailwind.config`, nem nos outros blocos. `bun run build` verde + `bun run test` 8/8.

---

### Task 1: Bloco Servicos — suporte a link opcional por card

**Files:** Modify `src/blocks/Servicos.astro`

- [ ] Na interface do item, adicionar `href?: string`. Cada card vira link quando tiver `href` (tag dinâmica), com afordância "Ver página →". Substituir o `.map` dos cards por:

```astro
{items.map((s) => {
  const Tag: any = s.href ? 'a' : 'article';
  return (
    <Tag href={s.href} class="card p-6 hover:border-secondary transition block group">
      <span class="ic mb-4">+</span>
      <h3 class="text-lg group-hover:text-primary transition">{s.title}</h3>
      <p class="mt-2 text-sm text-ink-muted">{s.text}</p>
      {s.href && <span class="mt-3 inline-block text-sm font-medium text-accent">Ver página →</span>}
    </Tag>
  );
})}
```

- [ ] Atualizar a interface `ServiceItem` (ou equivalente) pra incluir `href?: string`.

> Na home e em `/servicos` o bloco é chamado SEM `href` por item → cards continuam não-clicáveis, visual idêntico ao de hoje.

---

### Task 2: Página da matriz — alinhar tópicos/FAQ à esquerda + remover eyebrow + passar href

**Files:** Modify `src/pages/[local]/[servico].astro`

- [ ] **Seção TÓPICOS** — trocar o wrapper e remover a eyebrow "Guia completo":

DE:
```astro
<section class="section">
  <div class="container-x max-w-3xl">
    <span class="eyebrow">Guia completo</span>
    <h2 class="text-3xl">{servico.nome} {prep} {local.nome}: o que você precisa saber</h2>
    <div class="mt-8 space-y-8">
      ...tópicos...
    </div>
  </div>
</section>
```
PARA:
```astro
<section class="section">
  <div class="container-x">
    <div class="max-w-3xl">
      <h2 class="text-3xl">{servico.nome} {prep} {local.nome}: o que você precisa saber</h2>
      <div class="mt-8 space-y-8">
        ...tópicos (mesmo conteúdo)...
      </div>
    </div>
  </div>
</section>
```
(remove o `<span class="eyebrow">Guia completo</span>`; o `.map` dos tópicos fica idêntico.)

- [ ] **Seção PERGUNTAS FREQUENTES** — mesmo fix de alinhamento (mantém a eyebrow "Perguntas frequentes"):

DE: `<div class="container-x max-w-3xl">` → PARA: `<div class="container-x"><div class="max-w-3xl"> … </div></div>` (envolver o conteúdo da FAQ no filho `max-w-3xl`, fechar as duas divs).

- [ ] **Seção NOSSOS SERVIÇOS** — passar `href` por serviço (link pra mesma localidade):

DE:
```astro
<Servicos eyebrow="Nossos serviços" title="Tratamentos disponíveis" items={servicosList.map((s) => ({ title: s.nome, text: s.resumo }))} cta={{ label: 'Agendar avaliação', href: '#contato' }} />
```
PARA:
```astro
<Servicos eyebrow="Nossos serviços" title="Tratamentos disponíveis" items={servicosList.map((s) => ({ title: s.nome, text: s.resumo, href: `/${local.slug}/${s.slug}` }))} cta={{ label: 'Agendar avaliação', href: '#contato' }} />
```

---

### Task 3: Verificação + commit

- [ ] `bun run build` verde; `bun run test` 8/8.
- [ ] "Guia completo" sumiu da página: Grep tool por `Guia completo` em `dist/client/pinheiros/implante-dentario/index.html` → 0.
- [ ] Tópicos alinhados à esquerda: o wrapper agora é `container-x` > `max-w-3xl` (sem o max-w-3xl direto no container-x). Conferir no HTML/source.
- [ ] Links nos serviços: Grep tool por `href="/pinheiros/lente-de-contato-dental"` e `href="/pinheiros/odontopediatria"` em `dist/client/pinheiros/implante-dentario/index.html` → presentes.
- [ ] Home/`/servicos` sem regressão (cards de serviço sem link lá, visual igual): `/servicos` builda; bloco sem href não gera `<a>` de card.
- [ ] Commit: `git add src/pages/'[local]'/'[servico].astro' src/blocks/Servicos.astro && git commit -m "fix(local): tópicos alinhados à esquerda (sem eyebrow) + links de serviço por localidade"`

## Critério de pronto
- [ ] Tópicos e FAQ alinhados à esquerda (coluna de leitura no início do container)
- [ ] "Guia completo" removido
- [ ] Cards de "Tratamentos disponíveis" linkam `/{local}/{servico}` (interlink por localidade)
- [ ] Home/`/servicos` sem regressão; build verde, test 8/8
</content>
