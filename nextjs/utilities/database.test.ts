jest.mock('os', () => ({
  tmpdir: jest.fn().mockReturnValue('/temp'),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  writeFileSync: jest.fn(),
}));

process.env.RDS_CERTIFICATE = 'RDS_CERTIFICATE';
import { buildConnectionString } from './database';

const cert = 'randomHugeString';
const certUrl = '/temp/rds-ca-2019-root.pem';
const dbUrl = 'postgresql://user:pass@domain.com:5432';

describe('database helper', () => {
  test('it should fail when no dbUrl is set', () => {
    expect(() =>
      buildConnectionString({
        cert,
        dbUrl: undefined,
      })
    ).toThrowError('missing dbUrl variable');
  });

  test('it should append ssl information on the connection string with exist parameters', () => {
    expect(
      buildConnectionString({
        cert,
        dbUrl,
      })
    ).toBe(`${dbUrl}?ssl=true&sslrootcert=${certUrl}`);
  });

  test('it should append ssl information on the connection string without parameters', () => {
    expect(
      buildConnectionString({
        cert,
        dbUrl: dbUrl + '?connect_timeout=300',
      })
    ).toBe(`${dbUrl}?connect_timeout=300&ssl=true&sslrootcert=${certUrl}`);
  });
});
