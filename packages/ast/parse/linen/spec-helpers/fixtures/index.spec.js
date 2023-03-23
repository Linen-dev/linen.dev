const parse = require('../..');
const { readFileSync } = require('fs');
const { join } = require('path');

describe('#fixtures', () => {
  it('matches all inputs and outputs', () => {
    const input = readFileSync(
      join(__dirname, 'example/input.md'),
      'utf8'
    ).trim();
    const output = JSON.parse(
      readFileSync(join(__dirname, 'example/output.json'), 'utf8')
    );
    expect(parse(input)).toStrictEqual(output);
  });
});
