import { z } from 'zod';

// ── Shared primitives ─────────────────────────────────────────────────────────

const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const breadcrumbItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

// ── Block prop schemas ────────────────────────────────────────────────────────

export const heroPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  lead: z.string().optional(),
  cta: ctaSchema.optional(),
  rating: z.object({
    score: z.string(),
    count: z.string(),
  }).optional(),
  doctor: z.object({
    name: z.string(),
    role: z.string(),
    photo: z.string(),
  }).optional(),
  contact: z.object({
    phone: z.string(),
    hours: z.string(),
  }).optional(),
});

export const sobrePropsSchema = z.object({
  image: z.string().optional(),
  badge: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string(),
  lead: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  cta: ctaSchema.optional(),
});

export const servicosPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  items: z.array(z.object({
    title: z.string(),
    text: z.string(),
  })),
  cta: ctaSchema.optional(),
});

export const numerosPropsSchema = z.object({
  stats: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })),
});

export const porqueEscolherPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  image: z.string().optional(),
  features: z.array(z.object({
    title: z.string(),
    text: z.string(),
  })),
});

export const comoFuncionaPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  steps: z.array(z.object({
    n: z.string(),
    title: z.string(),
    text: z.string(),
  })),
});

export const equipePropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  members: z.array(z.object({
    name: z.string(),
    role: z.string(),
    photo: z.string(),
  })),
});

export const depoimentosPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  rating: z.object({
    score: z.string(),
    label: z.string(),
  }).optional(),
  items: z.array(z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string(),
  })),
});

export const antesDepoisPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  items: z.array(z.object({
    label: z.string(),
    before: z.string(),
    after: z.string(),
  })),
});

export const novidadesPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  items: z.array(z.object({
    title: z.string(),
    excerpt: z.string(),
    image: z.string(),
    href: z.string(),
  })),
});

export const ctaContatoPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  services: z.array(z.string()).optional(),
});

export const pageHeaderPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  lead: z.string().optional(),
  breadcrumb: z.array(breadcrumbItemSchema).optional(),
});

// ── Block discriminated union ─────────────────────────────────────────────────

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('hero'),            props: heroPropsSchema }),
  z.object({ type: z.literal('sobre'),           props: sobrePropsSchema }),
  z.object({ type: z.literal('servicos'),        props: servicosPropsSchema }),
  z.object({ type: z.literal('numeros'),         props: numerosPropsSchema }),
  z.object({ type: z.literal('porqueEscolher'),  props: porqueEscolherPropsSchema }),
  z.object({ type: z.literal('comoFunciona'),    props: comoFuncionaPropsSchema }),
  z.object({ type: z.literal('equipe'),          props: equipePropsSchema }),
  z.object({ type: z.literal('depoimentos'),     props: depoimentosPropsSchema }),
  z.object({ type: z.literal('antesDepois'),     props: antesDepoisPropsSchema }),
  z.object({ type: z.literal('novidades'),       props: novidadesPropsSchema }),
  z.object({ type: z.literal('ctaContato'),      props: ctaContatoPropsSchema }),
  z.object({ type: z.literal('pageHeader'),      props: pageHeaderPropsSchema }),
]);

// ── Top-level page schema ─────────────────────────────────────────────────────

export const pageMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
});

/** Shape for src/data/page.json (home — no meta wrapper) */
export const homePageSchema = z.object({
  blocks: z.array(blockSchema),
});

/** Shape for src/data/pages/*.json (inner pages — with meta wrapper) */
export const innerPageSchema = z.object({
  meta: pageMetaSchema,
  blocks: z.array(blockSchema),
});

export type Block        = z.infer<typeof blockSchema>;
export type HomPage      = z.infer<typeof homePageSchema>;
export type InnerPage    = z.infer<typeof innerPageSchema>;
export type PageMeta     = z.infer<typeof pageMetaSchema>;
