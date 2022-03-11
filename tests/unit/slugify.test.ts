import { createSlug } from '../../lib/util';

const longString = 'THIS Is a really long String'.repeat(100);

describe('slugify', () => {
  it('join spaces', () => {
    expect(createSlug(' something space  ')).toEqual('something-space');
  });
  it('removes emojis', () => {
    console.log(createSlug('something 😉 space '));
    expect(createSlug('something 😉 space ')).toEqual('something-space');
  });
  it('replaces underscores', () => {
    expect(createSlug('something_space ')).toEqual('something-space');
  });
  it('has default string', () => {
    expect(createSlug(' ')).toEqual('conversation');
  });
  it('handles long strings', () => {
    expect(createSlug(longString).length).toEqual(60);
  });

  it('handles punctunations', () => {
    expect(createSlug('! @ #$* *#! <> something space @*$(& ')).toEqual(
      'something-space'
    );
  });
});
