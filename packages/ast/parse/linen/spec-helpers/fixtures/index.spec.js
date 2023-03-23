const parse = require('../..');
const { readFileSync } = require('fs');
const { join } = require('path');

function test(dir) {
  it(`#${dir}`, () => {
    const input = readFileSync(join(__dirname, dir, 'input.md'), 'utf8').trim();
    const output = JSON.parse(
      readFileSync(join(__dirname, dir, 'output.json'), 'utf8')
    );
    expect(parse(input)).toStrictEqual(output);
  });
}

describe('#fixtures', () => {
  test('line-1');
  test('line-2');
});
