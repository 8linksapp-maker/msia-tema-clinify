import { describe, it, expect } from 'vitest';
import { BLOCK_TYPES } from '../blocks/types';
import page from '../data/page.json';
import servicos from '../data/pages/servicos.json';
import equipe from '../data/pages/equipe.json';
import sobre from '../data/pages/sobre.json';
import contato from '../data/pages/contato.json';
import agendar from '../data/pages/agendar.json';

const PAGES = { servicos, equipe, sobre, contato, agendar };

describe('page.json integrity', () => {
  it('every block.type is a known BLOCK_TYPE', () => {
    for (const b of page.blocks) {
      expect(BLOCK_TYPES).toContain(b.type);
    }
  });

  it('every block has a props object', () => {
    for (const b of page.blocks) {
      expect(typeof b.props).toBe('object');
    }
  });
});

describe('pages/*.json integrity', () => {
  it('toda página tem meta.title e meta.description', () => {
    for (const [name, p] of Object.entries(PAGES)) {
      expect(p.meta?.title, `${name}.title`).toBeTruthy();
      expect(p.meta?.description, `${name}.description`).toBeTruthy();
    }
  });

  it('todo block.type das páginas é conhecido', () => {
    for (const [name, p] of Object.entries(PAGES)) {
      for (const b of p.blocks) {
        expect(BLOCK_TYPES, `${name}: ${b.type}`).toContain(b.type);
      }
    }
  });

  it('toda página começa com pageHeader (h1 único)', () => {
    for (const [name, p] of Object.entries(PAGES)) {
      expect(p.blocks[0].type, `${name} deve abrir com pageHeader`).toBe('pageHeader');
    }
  });
});
