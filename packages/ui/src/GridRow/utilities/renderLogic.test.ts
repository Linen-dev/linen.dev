import { showAvatar, showTop } from './renderLogic';

// same thread different user -> true
// same thread same user -> false
// different thread different user -> true
// different thread same user -> true
describe('showTop', () => {
  describe('when previous message is from a different user', () => {
    it('returns true', () => {
      expect(showTop(false, false)).toBe(true);
    });
  });

  describe('when previous message is from the same user', () => {
    describe('when previous message is from a different thread', () => {
      it('returns true', () => {
        expect(showTop(true, false)).toBe(true);
      });
    });
    describe('when previous message is from the same thread', () => {
      it('returns false', () => {
        expect(showTop(true, true)).toBe(false);
      });
    });
  });

  describe('when isPreviousMessageFromSameUser is undefined', () => {
    it('returns true', () => {
      expect(showTop(undefined, false)).toBe(true);
    });
  });

  describe('when isPreviousMessageFromSameThread is undefined', () => {
    it('returns based on the value of isPreviousMessageFromSameUser', () => {
      expect(showTop(false, undefined)).toBe(true);
      expect(showTop(true, undefined)).toBe(false);
    });
  });
});
