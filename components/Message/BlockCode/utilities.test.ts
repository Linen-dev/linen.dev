import { isHighlighted } from './utilities';

describe('isHighlighted', () => {
  describe('when code contains react imports', () => {
    it('should return true', () => {
      expect(isHighlighted("import React from 'react';")).toBe(true);
      expect(isHighlighted('import React from "react";')).toBe(true);
    });
  });
});
