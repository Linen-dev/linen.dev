import { isHighlighted } from './utilities';

describe('isHighlighted', () => {
  describe('when code has a single line', () => {
    it('should return true', () => {
      expect(isHighlighted("import React from 'react';")).toBe(false);
    });
  });

  describe('when code has multiple lines', () => {
    it('should return true', () => {
      expect(
        isHighlighted(
          "import React from 'react';\nexport default function foo () {}"
        )
      ).toBe(true);
    });
  });
});
