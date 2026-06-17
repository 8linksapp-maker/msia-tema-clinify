# Clinify — Matriz: URL /localidade/serviço + nova ordem do wireframe Plan

> Use superpowers:executing-plans. Branch: `cms-scaffold-completo`.

**Goal:** (1) Mudar a URL da matriz pra `/{localidade}/{serviço}` (rota aninhada). (2) Reordenar o wireframe: Hero → Tópicos → Nossos serviços → Perguntas frequentes → Como nos encontrar → Notícias → Fale com a gente → Rodapé.

**Architecture:** A matriz sai do `[slug].astro` (que volta a servir SÓ as 5 páginas fixas) e ganha rota própria `src/pages/[local]/[servico].astro`. Não colide: `/blog/*` é prefixo explícito (vence o dinâmico), e as fixas são 1 segmento (`/servicos`) vs matriz 2 segmentos (`/pinheiros/implante-dentario`).

**Guard-rail:** NÃO mexer no visual dos blocos (`src/blocks/*` — reusados via props), `global.css`, `theme.ts`, `themes/`, `tailwind.config`. Pode editar: `[slug].astro` (simplificar), criar `[local]/[servico].astro`, editar `ComoNosEncontrar.astro` (add prop bairros), `paginas.astro` (URL nova). `bun run build` verde + `bun run test` 8/8.

> Site não está no ar → URL antiga não precisa de 301.

---

### Task 1: Simplificar `[slug].astro` (só páginas fixas)

**Files:** Modify `src/pages/[slug].astro`

- [ ] Substituir TODO o conteúdo por (remove o ramo da matriz + imports não usados):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BlockRenderer from '../blocks/BlockRenderer.astro';
import type { Block } from '../blocks/types';

export async function getStaticPaths() {
  const pageMods: Record<string, any> = import.meta.glob('../data/pages/*.json', { eager: true });
  return Object.entries(pageMods).map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace('.json', '');
    return { params: { slug }, props: { page: mod.default ?? mod } };
  });
}
const { page } = Astro.props as any;
---
<BaseLayout title={page.meta.title} description={page.meta.description}>
  <BlockRenderer blocks={page.blocks as Block[]} />
</BaseLayout>
```

---

### Task 2: Rota nova da matriz `[local]/[servico].astro`

**Files:** Create `src/pages/[local]/[servico].astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import LocalBusinessSchema from '../../components/local/LocalBusinessSchema.astro';
import ComoNosEncontrar from '../../components/local/ComoNosEncontrar.astro';
import Servicos from '../../blocks/Servicos.astro';
import Novidades from '../../blocks/Novidades.astro';
import CtaContato from '../../blocks/CtaContato.astro';
import site from '../../data/siteConfig.json';
import { marked } from 'marked';

export async function getStaticPaths() {
  const servicos = (await import('../../data/servicos.json')).default as any[];
  const locais = (await import('../../data/locais.json')).default as any[];
  const paths = [];
  for (const l of locais) {
    for (const s of servicos) {
      paths.push({ params: { local: l.slug, servico: s.slug }, props: { local: l, servico: s } });
    }
  }
  return paths;
}

const { local, servico } = Astro.props as any;
const prep = local.prep || 'em';
const servicosList = (await import('../../data/servicos.json')).default as any[];
---
<BaseLayout
  title={`${servico.nome} ${prep} ${local.nome} — ${site.name}`}
  description={`${servico.nome} ${prep} ${local.nome}: ${servico.resumo} ${local.referenciaLocal}`}
>
  <LocalBusinessSchema areaServed={[local.nome, ...(local.bairrosVizinhos || [])]} />

  {/* 1. HERO */}
  <section class="bg-soft">
    <div class="container-x section">
      <span class="eyebrow">{servico.nome}</span>
      <h1 class="text-4xl md:text-5xl max-w-3xl">{servico.nome} {prep} {local.nome}</h1>
      <p class="mt-4 text-lg max-w-2xl">{servico.resumo} {local.referenciaLocal}</p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Olá! Quero saber sobre ${servico.nome} ${prep} ${local.nome}.`)}`} class="btn-accent">Falar no WhatsApp</a>
        <a href={`tel:${site.phone}`} class="btn-ghost">Ligar agora</a>
      </div>
    </div>
  </section>

  {/* 2. TÓPICOS */}
  {servico.topicos?.length > 0 && (
    <section class="section">
      <div class="container-x max-w-3xl">
        <span class="eyebrow">Guia completo</span>
        <h2 class="text-3xl">{servico.nome} {prep} {local.nome}: o que você precisa saber</h2>
        <div class="mt-8 space-y-8">
          {servico.topicos.map((t: any) => {
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

  {/* 3. NOSSOS SERVIÇOS */}
  <Servicos eyebrow="Nossos serviços" title="Tratamentos disponíveis" items={servicosList.map((s) => ({ title: s.nome, text: s.resumo }))} cta={{ label: 'Agendar avaliação', href: '#contato' }} />

  {/* 4. PERGUNTAS FREQUENTES */}
  {local.faq?.length > 0 && (
    <section class="section bg-soft">
      <div class="container-x max-w-3xl">
        <span class="eyebrow">Perguntas frequentes</span>
        <h2 class="text-3xl">Dúvidas sobre {servico.nome.toLowerCase()} {prep} {local.nome}</h2>
        <div class="mt-8 space-y-3">
          {local.faq.map((f: any) => (
            <details class="border-b border-border pb-3">
              <summary class="font-medium text-ink cursor-pointer">{f.q}</summary>
              <p class="mt-2 text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )}

  {/* 5. COMO NOS ENCONTRAR */}
  <ComoNosEncontrar areaExtra={local.bairrosVizinhos} />

  {/* 6. NOTÍCIAS */}
  <Novidades eyebrow="Notícias" title="Conteúdo para o seu sorriso" />

  {/* 7. FALE COM A GENTE */}
  <CtaContato eyebrow="Fale com a gente" title={`Agende ${servico.nome.toLowerCase()} ${prep} ${local.nome}`} services={servicosList.map((s) => s.nome)} origem={`${servico.slug}|${local.slug}`} />

  {/* 8. RODAPÉ: via BaseLayout */}
</BaseLayout>
```

---

### Task 3: `ComoNosEncontrar` — bairros vizinhos

**Files:** Modify `src/components/local/ComoNosEncontrar.astro`

- [ ] Aceitar prop `areaExtra?: string[]` e, se houver, mostrar uma linha "Atendemos também: {lista}". Adicionar à interface Props e desestruturar; no bloco de NAP (depois do horário), adicionar:
```astro
{areaExtra && areaExtra.length > 0 && (
  <li><span class="font-semibold text-ink">Também atendemos:</span> {areaExtra.join(', ')}</li>
)}
```

---

### Task 4: `paginas.astro` — URL nova no mapa do site

**Files:** Modify `src/pages/admin/paginas.astro`

- [ ] Na geração da matriz, trocar a URL pra aninhada:
```ts
matriz.push({ servico: s.nome, localidade: l.nome, url: `/${l.slug}/${s.slug}` });
```
(antes era `/${s.slug}-${l.prep||'em'}-${l.slug}`)

---

### Task 5: Verificação + commit

- [ ] `bun run build` verde; `bun run test` 8/8.
- [ ] Rota nova existe: `ls dist/client/pinheiros/implante-dentario/index.html` (e a antiga NÃO: `ls dist/client/implante-dentario-em-pinheiros 2>/dev/null` deve falhar).
- [ ] Ordem do wireframe numa página: no HTML de `dist/client/pinheiros/implante-dentario/index.html`, a sequência de eyebrows/headings é Hero(H1) → "Guia completo"(tópicos) → "Nossos serviços" → "Perguntas frequentes" → "Como nos encontrar" → "Notícias" → "Fale com a gente". (Grep tool pelos textos das eyebrows e confira a ordem.)
- [ ] H1 único (só o hero).
- [ ] 27 páginas geradas (9×3) na nova URL: `ls dist/client/*/  | grep -c index` ou contar `dist/client/{pinheiros,moema,tatuape}/*/index.html`.
- [ ] Páginas fixas e blog intactas (`/servicos`, `/blog` buildam).
- [ ] Commit: `git add -A && git commit -m "feat(local): URL /localidade/serviço + reordena wireframe da matriz"`

## Critério de pronto
- [ ] URL da matriz = `/{localidade}/{serviço}` (27 páginas), antiga removida
- [ ] Ordem: Hero → Tópicos → Serviços → FAQ → Como nos encontrar → Notícias → Contato → Rodapé
- [ ] FAQ é seção própria; referenciaLocal no hero; bairros em "Como nos encontrar"
- [ ] Mapa do site (`/admin/paginas`) mostra as URLs novas
- [ ] Build verde, test 8/8, visual/blocos intocados
</content>
