import { getImageWidth } from './dimensions';

describe('#getImageWidth', () => {
  it('returns the width if the url contains sizes', () => {
    const url = 'https://foo.com/image_24x24.jpg';
    expect(getImageWidth(url)).toEqual(24);
  });
});
