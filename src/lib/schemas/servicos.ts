import { z } from 'zod';

export const topicoSchema = z.object({
  nivel: z.enum(['h2', 'h3', 'h4']).default('h2'),
  titulo: z.string(),
  conteudo: z.string().default(''),
});

export const servicoItemSchema = z.object({
  slug: z.string(),
  nome: z.string(),
  resumo: z.string(),
  topicos: z.array(topicoSchema).default([]),
});

export const servicosSchema = z.array(servicoItemSchema);

export type ServicoItem = z.infer<typeof servicoItemSchema>;
export type Servicos = z.infer<typeof servicosSchema>;
