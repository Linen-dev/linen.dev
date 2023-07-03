import { isEmailValid } from './email';

describe('isEmailValid', () => {
  describe('when validating a valid email string', () => {
    it('should return true', () => {
      const validEmails =
        'shubham@example.com, john.doe@example.com, jane.smith@example.com';
      expect(isEmailValid(validEmails)).toBeTruthy();
    });

    it('should return true for a single valid email address', () => {
      const singleValidEmail = 'shubham@example.com';
      expect(isEmailValid(singleValidEmail)).toBeTruthy();
    });
  });

  describe('when validating an invalid email string', () => {
    it('should return false', () => {
      const invalidEmails =
        'shubham@example, john.doe@example, jane.smith@example';
      expect(isEmailValid(invalidEmails)).toBeFalsy();
    });

    it('should return false for a single invalid email address', () => {
      const singleInvalidEmail = 'shubham@example';
      expect(isEmailValid(singleInvalidEmail)).toBeFalsy();
    });
  });

  describe('when validating an empty email string', () => {
    it('should return false', () => {
      const emptyString = '';
      expect(isEmailValid(emptyString)).toBeFalsy();
    });
  });
});
