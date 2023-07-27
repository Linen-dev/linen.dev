import { calculateDimensions } from './image';

describe('#calculateDimensions', () => {
  it('returns 200x200 if there are no dimensions', () => {
    expect(calculateDimensions(null)).toEqual({ width: 200, height: 200 });
  });

  it('returns dimensions if height is below 400', () => {
    expect(calculateDimensions({ width: 300, height: 200 })).toEqual({
      width: 300,
      height: 200,
    });
  });

  it('shrinks down dimensions if height is above 400', () => {
    expect(calculateDimensions({ width: 300, height: 450 })).toEqual({
      width: 150,
      height: 225,
    });
    expect(calculateDimensions({ width: 400, height: 1000 })).toEqual({
      width: 100,
      height: 250,
    });
    expect(calculateDimensions({ width: 800, height: 2000 })).toEqual({
      width: 100,
      height: 250,
    });
    expect(calculateDimensions({ width: 311, height: 579 })).toEqual({
      width: 155,
      height: 289,
    });
    expect(calculateDimensions({ width: 2950, height: 1678 })).toEqual({
      width: 368,
      height: 209,
    });
  });
});
