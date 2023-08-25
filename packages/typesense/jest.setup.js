module.exports = async function (globalConfig, projectConfig) {
  const result = require('dotenv').config({ path: '../../apps/web/.env.test' });

  if (result.error) {
    throw result.error;
  }

  process.env.NEXT_PUBLIC_TYPESENSE_HOST = 'localhost';
  process.env.TYPESENSE_ADMIN = 'xyz';
  process.env.TYPESENSE_DATABASE = 'testing';

  const { init } = require('./src/init');

  const key = await init();
  if (key) {
    process.env.TYPESENSE_SEARCH_ONLY = key.value;
    globalThis.__KEY__ = key;
  }
};
