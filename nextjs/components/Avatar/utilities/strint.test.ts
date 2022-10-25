import { getLetter } from './string';

describe('getLetter', () => {
  it('returns the first letter, lowercased', () => {
    expect(getLetter('Anna')).toEqual('a');
    expect(getLetter('Ben')).toEqual('b');
    expect(getLetter('Ceslav')).toEqual('c');
    expect(getLetter('Daana')).toEqual('d');
    expect(getLetter('Emil')).toEqual('e');
    expect(getLetter('Faakhir')).toEqual('f');
    expect(getLetter('Gaadhi')).toEqual('g');
    expect(getLetter('Iaicchik')).toEqual('i');
    expect(getLetter('John')).toEqual('j');
    expect(getLetter('Kam')).toEqual('k');
    expect(getLetter('Sandro')).toEqual('s');
    expect(getLetter('Thomas')).toEqual('t');
    expect(getLetter('Quentin')).toEqual('q');
  });

  it('returns the first letter, lowercased, of special characters', () => {
    expect(getLetter('Łukasz')).toEqual('ł');
    expect(getLetter('Øyvind')).toEqual('ø');
    expect(getLetter('Żaneta')).toEqual('ż');
  });

  it('trims the display name', () => {
    expect(getLetter('   John   ')).toEqual('j');
  });

  describe('when display name starts with a number', () => {
    it('returns `u` as the letter', () => {
      expect(getLetter('1Tom')).toEqual('u');
    });
  });

  describe('when display name starts with a chinese letter', () => {
    it('returns `u` as the letter', () => {
      expect(getLetter('孫')).toEqual('u');
    });
  });
});
