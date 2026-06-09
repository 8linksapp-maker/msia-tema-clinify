// Mapa type → componente Astro. Astro não expõe um tipo público estável p/
// componentes, então usamos `unknown` + cast no renderer (seguro: só renderiza).
// Cada Task de bloco adiciona: import + entrada no mapa abaixo.
export const blockRegistry: Record<string, unknown> = {};
