import { cleanUpQuotedEmail } from './parser';

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
});
