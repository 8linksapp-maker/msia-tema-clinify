export const BLOCK_TYPES = [
  'hero', 'sobre', 'servicos', 'numeros', 'porqueEscolher',
  'comoFunciona', 'equipe', 'depoimentos', 'antesDepois',
  'novidades', 'ctaContato',
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export interface Block { type: BlockType; props: Record<string, unknown>; }
