import { serializeEmail } from './email';

describe('email', () => {
  test('serialize', () => {
    expect(serializeEmail('mail@mail.com')).toBe('mail@mail.com');
  });
  test('serialize multiple emails', () => {
    expect(serializeEmail('mail@mail.com,mail2@mail.com')).toBe(
      'mail@mail.com'
    );
  });
  test('serialize upper case', () => {
    expect(serializeEmail('MAIL@mail.com,mail2@mail.com')).toBe(
      'mail@mail.com'
    );
  });
  test('serialize bad chars', () => {
    expect(serializeEmail('MAIL”@mail.com,mail2@mail.com')).toBe(
      'mail@mail.com'
    );
  });
  test('serialize bad chars 2', () => {
    expect(serializeEmail('MAIL”.hOla@mail.com,mail2@mail.com')).toBe(
      'mail.hola@mail.com'
    );
  });
  test('serialize bad chars 3', () => {
    expect(serializeEmail('test+test123@mail.com,mail2@mail.com')).toBe(
      'test+test123@mail.com'
    );
  });
});
