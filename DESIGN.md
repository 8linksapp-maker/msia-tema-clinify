# DESIGN — Clinify (Dentaire-inspired)

**North star:** clínica moderna, clean, confiável-acolhedora. Inspiração: https://html.awaikenthemes.com/dentaire/ (não é cópia — referência de paleta, tipografia e estrutura de seções).

## Tokens (preset default `dental`)
Fonte de verdade: `src/data/themes/dental.json` → injetado como CSS var por `ThemeStyle.astro` → consumido pelos tokens semânticos do Tailwind (`tailwind.config.mjs`).

| Token | Hex | Papel |
|---|---|---|
| primary | #0E384C | petróleo (marca, headings, footer) |
| accent | #FFA800 | âmbar (CTA, destaques, números) |
| secondary | #1E84B5 | azul clínico (ícones, hovers) |
| ink | #0E384C | texto primário |
| ink-muted | #527282 | texto secundário |
| soft | #EFF8FF | fundo de seção alternada |
| bg / surface | #FFFFFF | fundo / cards |
| border | #E1ECF2 | bordas hairline |
| accent-ink | #0E384C | texto sobre botão âmbar |

**Tipografia:** Poppins (300–800) em tudo (display + body).
**Forma:** cards `rounded-2xl`, botões `rounded-full`, muito whitespace (`section` = py 16/24), flat com borda hairline.

## Regras
- Nenhum hex hardcoded em componente — só classes de token (`bg-soft`, `text-accent`, `card`, `btn-accent`).
- Multi-especialidade = trocar `preset` em `src/data/theme.json`. Adicionar nicho = novo `themes/<nicho>.json`.
- Touch targets ≥ 44px, `prefers-reduced-motion` respeitado (global.css), `lang="pt-BR"`.

## Componentes utilitários (global.css)
`.container-x` `.section` `.eyebrow` `.btn-accent` `.btn-primary` `.btn-ghost` `.card` `.ic`
