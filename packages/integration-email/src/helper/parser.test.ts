import { cleanUpQuotedEmail, parseResponse } from './parser';

const text =
  'hey, make some tests' +
  '\n' +
  'On Wed, Feb 1, 2023 at 9:43 PM Full Name <test@linen.dev> wrote:\n' +
  '\n' +
  '> hey\n' +
  '>\n' +
  '>\n' +
  '> On Wed, Feb 1, 2023 at 9:42 PM Full Name <test@linenthreads.dev> wrote:\n' +
  '>\n' +
  '>> cool man\n' +
  '>>\n' +
  '>\n';

describe('parser test', () => {
  test('cleanUpQuotedEmail', () => {
    expect(cleanUpQuotedEmail(text)).toBe('hey, make some tests');
  });

  test('clean up response', () => {
    expect(
      parseResponse(
        '250 Ok 010101862d5e96ce-4e90e58d-52b6-435e-baec-91c9780fa598-000000'
      )
    ).toBe(
      encodeURIComponent(
        '<010101862d5e96ce-4e90e58d-52b6-435e-baec-91c9780fa598-000000@us-west-2.amazonses.com>'
      )
    );
  });
});
