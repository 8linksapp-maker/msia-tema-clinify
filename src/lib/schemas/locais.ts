import { z } from 'zod';

export const faqItemSchema = z.object({
  q: z.string(),
  a: z.string(),
});

export const localItemSchema = z.object({
  slug: z.string(),
  nome: z.string(),
  prep: z.string(),
  regiao: z.string(),
  bairrosVizinhos: z.array(z.string()),
  referenciaLocal: z.string(),
  faq: z.array(faqItemSchema),
});

export const locaisSchema = z.array(localItemSchema);

export type FaqItem = z.infer<typeof faqItemSchema>;
export type LocalItem = z.infer<typeof localItemSchema>;
export type Locais = z.infer<typeof locaisSchema>;
