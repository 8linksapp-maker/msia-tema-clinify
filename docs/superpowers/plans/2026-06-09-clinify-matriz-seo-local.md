# Clinify — Matriz SEO Local (serviço × localidade) — Fase A (FE) Plan

> **For agentic workers:** Use superpowers:executing-plans. Branch: `cms-scaffold-completo`. Segue a skill `seo-local` adaptada pro clinify (MSIA, não 8links).

**Goal:** Gerar uma página por combinação **serviço × localidade** (URL própria, ex `/implante-dentario-em-pinheiros`), no wireframe canônico de 7 seções, com NAP de fonte única, schema `LocalBusiness`, CTA WhatsApp e captura de lead com atribuição. Anti-doorway: conteúdo único por localidade.

**Architecture:** Eixos em `src/data/servicos.json` × `src/data/locais.json`. O `src/pages/[slug].astro` (que já gera as 5 páginas fixas) é estendido pra também gerar a matriz via `getStaticPaths` (URLs limpas na raiz, sem colidir com `/blog`). Lead → o `/api/subscribe` existente, carimbando serviço+localidade. NAP estruturado vem do `siteConfig.json`.

**Fase B (depois, pipeline walker):** editores de Localidades e Serviços no CMS.

**Skill de referência:** `seo-local` (wireframe 7 seções, NAP única, LocalBusiness, anti-doorway).

---

## Guard-rail
- Pode editar: `src/pages/[slug].astro` (estender), `src/data/*.json` (novos + estender siteConfig com `nap`), criar componentes em `src/components/local/`, e o form de matriz. Reusar os blocos existentes (`src/blocks/*`) SEM alterar o markup deles.
- NÃO alterar o visual dos blocos existentes, `global.css`, `theme.ts`, `tailwind.config`. NÃO quebrar as páginas/blog atuais.
- `bun run build` verde + `bun run test` 8/8 ao fim.

---

### Task 1: Dados — serviços, localidades, NAP

**Files:** Create `src/data/servicos.json`, `src/data/locais.json`; Modify `src/data/siteConfig.json`

- [ ] **Step 1: `src/data/servicos.json`** (os 9 serviços = as 9 KW; seed odontológico)

```json
[
  { "slug": "implante-dentario", "nome": "Implante dentário", "resumo": "Reposição de dentes com naturalidade e firmeza." },
  { "slug": "clareamento-dental", "nome": "Clareamento dental", "resumo": "Sorriso mais branco com segurança e acompanhamento." },
  { "slug": "ortodontia", "nome": "Ortodontia (aparelho)", "resumo": "Alinhamento dos dentes com aparelho fixo ou alinhadores." },
  { "slug": "lentes-de-contato-dental", "nome": "Lentes de contato dental", "resumo": "Facetas finas para um sorriso harmônico." },
  { "slug": "tratamento-de-canal", "nome": "Tratamento de canal", "resumo": "Endodontia para salvar o dente com conforto." },
  { "slug": "limpeza-e-prevencao", "nome": "Limpeza e prevenção", "resumo": "Profilaxia e cuidado de rotina para a saúde bucal." },
  { "slug": "protese-dentaria", "nome": "Prótese dentária", "resumo": "Reabilitação oral fixa ou removível." },
  { "slug": "odontopediatria", "nome": "Odontopediatria", "resumo": "Cuidado odontológico gentil para crianças." },
  { "slug": "urgencia-odontologica", "nome": "Urgência odontológica", "resumo": "Atendimento rápido para dor e emergências." }
]
```

- [ ] **Step 2: `src/data/locais.json`** (localidades curadas + conteúdo único anti-doorway; seed 3 exemplos)

```json
[
  {
    "slug": "pinheiros", "nome": "Pinheiros", "prep": "em",
    "regiao": "Zona Oeste de São Paulo",
    "bairrosVizinhos": ["Vila Madalena", "Jardim Paulista", "Itaim Bibi"],
    "referenciaLocal": "Atendemos pacientes de Pinheiros e região, perto da Faria Lima e da Rua dos Pinheiros.",
    "faq": [
      { "q": "Vocês atendem urgência em Pinheiros?", "a": "Sim, temos horários reservados para urgências odontológicas no mesmo dia." },
      { "q": "Tem estacionamento perto?", "a": "Há estacionamentos rotativos na região e fácil acesso por transporte público." }
    ]
  },
  {
    "slug": "moema", "nome": "Moema", "prep": "em",
    "regiao": "Zona Sul de São Paulo",
    "bairrosVizinhos": ["Vila Nova Conceição", "Campo Belo", "Indianópolis"],
    "referenciaLocal": "Próximo ao Parque Ibirapuera e à Av. Ibirapuera, atendemos toda a região de Moema.",
    "faq": [
      { "q": "Quanto tempo dura uma avaliação?", "a": "A primeira avaliação leva cerca de 40 minutos, com diagnóstico e plano de tratamento." },
      { "q": "Aceitam parcelamento?", "a": "Sim, oferecemos condições de pagamento facilitadas." }
    ]
  },
  {
    "slug": "tatuape", "nome": "Tatuapé", "prep": "no",
    "regiao": "Zona Leste de São Paulo",
    "bairrosVizinhos": ["Vila Formosa", "Anália Franco", "Carrão"],
    "referenciaLocal": "No coração da Zona Leste, atendemos pacientes do Tatuapé e bairros vizinhos.",
    "faq": [
      { "q": "Fazem implante em quanto tempo?", "a": "Depende do caso; após a avaliação explicamos o cronograma completo." },
      { "q": "Atendem crianças?", "a": "Sim, temos odontopediatria com atendimento gentil." }
    ]
  }
]
```

- [ ] **Step 3: Estender `src/data/siteConfig.json`** — adicionar bloco `nap` estruturado (mantém os campos existentes). Adicione ao JSON:

```json
"nap": {
  "streetAddress": "Av. Paulista, 1000",
  "addressLocality": "São Paulo",
  "addressRegion": "SP",
  "postalCode": "01310-100",
  "country": "BR",
  "latitude": -23.5613,
  "longitude": -46.6565,
  "priceRange": "$$",
  "mapEmbed": "https://www.google.com/maps?q=Av.+Paulista+1000+S%C3%A3o+Paulo&output=embed"
}
```

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(local): dados da matriz (servicos + locais + NAP estruturado)"`

---

### Task 2: Schema LocalBusiness (componente)

**Files:** Create `src/components/local/LocalBusinessSchema.astro`

- [ ] **Step 1:**

```astro
---
import site from '../../data/siteConfig.json';
interface Props { areaServed?: string[]; }
const { areaServed = [] } = Astro.props;
const nap = (site as any).nap || {};
const schema = {
  '@context': 'https://schema.org',
  '@type': 'Dentist',
  name: site.name,
  telephone: site.phone,
  email: site.email,
  url: site.url || undefined,
  priceRange: nap.priceRange || '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: nap.streetAddress,
    addressLocality: nap.addressLocality,
    addressRegion: nap.addressRegion,
    postalCode: nap.postalCode,
    addressCountry: nap.country || 'BR',
  },
  ...(nap.latitude ? { geo: { '@type': 'GeoCoordinates', latitude: nap.latitude, longitude: nap.longitude } } : {}),
  ...(areaServed.length ? { areaServed } : {}),
  openingHours: site.hours,
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

- [ ] **Step 2: Commit** — `git add -A && git commit -m "feat(local): schema LocalBusiness (Dentist) de fonte única"`

---

### Task 3: Seção "Como nos encontrar" (mapa + NAP)

**Files:** Create `src/components/local/ComoNosEncontrar.astro`

- [ ] **Step 1:**

```astro
---
import site from '../../data/siteConfig.json';
const nap = (site as any).nap || {};
---
<section id="encontrar" class="section bg-soft">
  <div class="container-x grid gap-10 lg:grid-cols-2 items-center">
    <div>
      <span class="eyebrow">Como nos encontrar</span>
      <h2 class="text-3xl md:text-4xl">Venha até a {site.name}.</h2>
      <ul class="mt-6 space-y-2 text-ink-muted">
        <li><span class="font-semibold text-ink">Endereço:</span> {site.address}</li>
        <li><span class="font-semibold text-ink">Telefone:</span> {site.phone}</li>
        <li><span class="font-semibold text-ink">Horário:</span> {site.hours}</li>
      </ul>
      <a href={`https://wa.me/${site.whatsapp}`} class="btn-accent mt-6">Chamar no WhatsApp</a>
    </div>
    {nap.mapEmbed && (
      <div class="rounded-2xl overflow-hidden border border-border aspect-[4/3]">
        <iframe src={nap.mapEmbed} width="100%" height="100%" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa"></iframe>
      </div>
    )}
  </div>
</section>
```

> NAP idêntico ao do rodapé e do schema — fonte única `siteConfig`.

- [ ] **Step 2: Commit** — `git add -A && git commit -m "feat(local): seção Como nos encontrar (mapa + NAP)"`

---

### Task 4: Estender `[slug].astro` — gerar a matriz

**Files:** Modify `src/pages/[slug].astro`

> Hoje o `getStaticPaths` lê só `pages/*.json`. Estender pra também emitir as combinações serviço×localidade, e o template ramifica por `kind`.

- [ ] **Step 1: Reescrever `src/pages/[slug].astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import BlockRenderer from '../blocks/BlockRenderer.astro';
import LocalBusinessSchema from '../components/local/LocalBusinessSchema.astro';
import ComoNosEncontrar from '../components/local/ComoNosEncontrar.astro';
import Servicos from '../blocks/Servicos.astro';
import Novidades from '../blocks/Novidades.astro';
import CtaContato from '../blocks/CtaContato.astro';
import site from '../data/siteConfig.json';
import type { Block } from '../blocks/types';

export async function getStaticPaths() {
  const pageMods: Record<string, any> = import.meta.glob('../data/pages/*.json', { eager: true });
  const fixed = Object.entries(pageMods).map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace('.json', '');
    return { params: { slug }, props: { kind: 'page', page: mod.default ?? mod } };
  });

  const servicos = (await import('../data/servicos.json')).default as any[];
  const locais = (await import('../data/locais.json')).default as any[];
  const matrix = [];
  for (const s of servicos) {
    for (const l of locais) {
      matrix.push({
        params: { slug: `${s.slug}-${l.prep || 'em'}-${l.slug}` },
        props: { kind: 'local', servico: s, local: l },
      });
    }
  }
  return [...fixed, ...matrix];
}

const props = Astro.props as any;
const servicosList = (await import('../data/servicos.json')).default as any[];
---
{props.kind === 'page' ? (
  <BaseLayout title={props.page.meta.title} description={props.page.meta.description}>
    <BlockRenderer blocks={props.page.blocks as Block[]} />
  </BaseLayout>
) : (
  <BaseLayout
    title={`${props.servico.nome} ${props.local.prep || 'em'} ${props.local.nome} — ${site.name}`}
    description={`${props.servico.nome} ${props.local.prep || 'em'} ${props.local.nome}: ${props.servico.resumo} ${props.local.referenciaLocal}`}
    ogType="website"
  >
    <LocalBusinessSchema areaServed={[props.local.nome, ...(props.local.bairrosVizinhos || [])]} />

    <!-- 1. Hero + CTA WhatsApp -->
    <section class="bg-soft">
      <div class="container-x section">
        <span class="eyebrow">{props.servico.nome}</span>
        <h1 class="text-4xl md:text-5xl max-w-3xl">{props.servico.nome} {props.local.prep || 'em'} {props.local.nome}</h1>
        <p class="mt-4 text-lg max-w-2xl">{props.servico.resumo} {props.local.referenciaLocal}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`Olá! Quero saber sobre ${props.servico.nome} ${props.local.prep || 'em'} ${props.local.nome}.`)}`} class="btn-accent">Falar no WhatsApp</a>
          <a href={`tel:${site.phone}`} class="btn-ghost">Ligar agora</a>
        </div>
      </div>
    </section>

    <!-- 2. Nossos serviços (9 fixos) -->
    <Servicos eyebrow="Nossos serviços" title="Tratamentos disponíveis" items={servicosList.map((s) => ({ title: s.nome, text: s.resumo }))} cta={{ label: 'Agendar avaliação', href: '#contato' }} />

    <!-- 3. Sobre / conteúdo único da região (anti-doorway) -->
    <section class="section">
      <div class="container-x max-w-3xl">
        <span class="eyebrow">Atendimento em {props.local.nome}</span>
        <h2 class="text-3xl">Referência em {props.servico.nome.toLowerCase()} {props.local.prep || 'em'} {props.local.nome}</h2>
        <p class="mt-4 text-ink-muted">{props.local.referenciaLocal} Atendemos também {(props.local.bairrosVizinhos || []).join(', ')}.</p>
        {props.local.faq?.length > 0 && (
          <div class="mt-8 space-y-4">
            <h3 class="text-xl">Perguntas frequentes</h3>
            {props.local.faq.map((f: any) => (
              <details class="border-b border-border pb-3">
                <summary class="font-medium text-ink cursor-pointer">{f.q}</summary>
                <p class="mt-2 text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>

    <!-- 4. Como nos encontrar (mapa + NAP + schema acima) -->
    <ComoNosEncontrar />

    <!-- 5. Últimas do blog -->
    <Novidades eyebrow="Novidades" title="Conteúdo para o seu sorriso" />

    <!-- 6. Contato (form grava lead com atribuição) -->
    <CtaContato eyebrow="Fale com a gente" title={`Agende ${props.servico.nome.toLowerCase()} ${props.local.prep || 'em'} ${props.local.nome}`} services={servicosList.map((s) => s.nome)} origem={`${props.servico.slug}|${props.local.slug}`} />
  </BaseLayout>
)}
```

> O `CtaContato` recebe uma prop nova `origem` (Task 5). Footer (NAP) já vem do `BaseLayout`.

- [ ] **Step 2: Verificar** — `bun run build && ls dist/implante-dentario-em-pinheiros/index.html` → existe (9×3 = 27 páginas geradas).

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat(local): matriz serviço×localidade no [slug].astro (wireframe 7 seções)"`

---

### Task 5: Atribuição de lead (serviço|localidade) no form

**Files:** Modify `src/blocks/CtaContato.astro`, `src/pages/api/subscribe.ts`

- [ ] **Step 1: `CtaContato.astro`** — aceitar prop `origem` e mandar como campo hidden no form.

Adicionar à interface Props: `origem?: string;` e desestruturar. Dentro do `<form>`, adicionar:
```astro
{origem && <input type="hidden" name="origem" value={origem} />}
```
(Não alterar o resto do layout do form.)

- [ ] **Step 2: `src/pages/api/subscribe.ts`** — o `origem` já é lido (`body.origem`). Adicionar também `localidade`/`servico` derivados, se vierem. O endpoint já grava `origem`; confirme que persiste. Se quiser separar, faça split de `origem` por `|` em `{servico, localidade}` no registro do lead. Mantenha compatível com o uso atual (form normal manda `servico` direto).

```ts
// dentro do POST, ao montar o lead, derive de origem se vier no formato "servico|localidade":
const [origServico, origLocalidade] = (body.origem || '').split('|');
// e adicione ao objeto lead:
// servico: (body.servico || origServico || '').trim() || undefined,
// localidade: (origLocalidade || '').trim() || undefined,
```

- [ ] **Step 3: Verificar** — `bun run build` → PASS.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(local): atribuição de lead (serviço|localidade) na origem"`

---

### Task 6: Verificação final

- [ ] **Step 1:** `bun run build` verde; `bun run test` 8/8.
- [ ] **Step 2:** Contar páginas da matriz: `ls dist/ | grep -E "(implante|clareamento|ortodontia).*-(em|no)-(pinheiros|moema|tatuape)" | wc -l` → 27 (9×3).
- [ ] **Step 3:** Conferir NAP idêntico: o telefone do `siteConfig` aparece na seção "Como nos encontrar", no rodapé e no JSON-LD de uma página da matriz.
- [ ] **Step 4:** Conferir `LocalBusiness`/`Dentist` no HTML de uma página: `grep -o '"@type":"Dentist"' dist/implante-dentario-em-pinheiros/index.html`.
- [ ] **Step 5:** Frontend existente intocado: `/`, `/servicos`, `/blog` buildam igual.

## Critério de pronto (Fase A)
- [ ] Matriz gera 1 página por serviço×localidade (27 no seed), URL própria
- [ ] Wireframe 7 seções por página (Hero+WhatsApp, 9 serviços, Sobre/região única, Como nos encontrar, blog, Contato, Rodapé NAP)
- [ ] NAP de fonte única idêntico (seção + rodapé + schema)
- [ ] `LocalBusiness`/`Dentist` JSON-LD por página, `areaServed` = localidade + vizinhos
- [ ] Conteúdo único por localidade (referência + bairros + FAQ) — anti-doorway
- [ ] Form grava lead com atribuição serviço|localidade no `/api/subscribe`
- [ ] CTA primário WhatsApp; build verde; frontend antigo intocado

## Fase B (depois — pipeline walker)
walker-mapper(`servicos.json`,`locais.json`) → walker-cms-builder → editores **Serviços** e **Localidades** no /admin (CRUD), pra a clínica gerenciar a matriz. Novo item → rebuild → páginas no ar.
</content>
