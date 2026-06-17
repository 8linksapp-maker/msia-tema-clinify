import { z } from 'zod';

export const servicoItemSchema = z.object({
  slug: z.string(),
  nome: z.string(),
  resumo: z.string(),
  topicos: z.array(z.string()).default([]),
});

export const servicosSchema = z.array(servicoItemSchema);

export type ServicoItem = z.infer<typeof servicoItemSchema>;
export type Servicos = z.infer<typeof servicosSchema>;
