import { describe, it, expect } from 'vitest';
import { BLOCK_TYPES } from '../blocks/types';
import page from '../data/page.json';

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
