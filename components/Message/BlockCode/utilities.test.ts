import { isHighlighted, isFormattable, formatCode } from './utilities';

describe('isHighlighted', () => {
  describe('when code has a single line', () => {
    it('returns true', () => {
      expect(isHighlighted("import React from 'react';")).toBe(false);
    });
  });

  describe('when code has multiple lines', () => {
    it('returns true', () => {
      expect(
        isHighlighted(
          "import React from 'react';\nexport default function foo () {}"
        )
      ).toBe(true);
    });
  });
});

describe('isFormattable', () => {
  describe('when code is not in the JSON format', () => {
    it('returns false', () => {
      expect(isFormattable("import React from 'react';")).toBe(false);
      expect(isFormattable('true')).toBe(false);
      expect(isFormattable('false')).toBe(false);
      expect(isFormattable('["foo", "bar"]')).toBe(false);
    });
  });

  describe('when code is in the JSON format', () => {
    it('returns true', () => {
      expect(isFormattable('{}')).toBe(true);
      expect(isFormattable('{"foo": "bar"}')).toBe(true);
    });
  });
});

describe('formatCode', () => {
  describe('when code is not in the JSON format', () => {
    it('returns the code', () => {
      expect(formatCode("import React from 'react';")).toBe(
        "import React from 'react';"
      );
    });
  });

  describe('when code is in the JSON format', () => {
    it('returns the formatted code', () => {
      expect(formatCode('{"foo": "bar"}')).toEqual('{\n  "foo": "bar"\n}');
    });
  });
});
