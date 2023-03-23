const parse = require('../..');
const { readFileSync } = require('fs');
const { join } = require('path');

function test(dir) {
  it(`#${dir}`, () => {
    const input = readFileSync(join(__dirname, dir, 'input.md'), 'utf8').trim();
    const output = JSON.parse(
      readFileSync(join(__dirname, dir, 'output.json'), 'utf8')
    );
    let result = parse(input);
    try {
      expect(result).toStrictEqual(output);
    } catch (exception) {
      if (process.env.DEBUG) {
        console.error(JSON.stringify(result, null, 2));
        console.log(JSON.stringify(output, null, 2));
      }
      throw new Error(`spec ${dir} failed`);
    }
  });
}

describe('#fixtures', () => {
  test('line-1');
  test('line-2');
  test('line-3');
  test('list-1');
  test('list-2');
  test('list-3');
  test('list-4');
  // test('list-5');
  test('list-6');
  test('list-7');
  test('mixed-1');
});
