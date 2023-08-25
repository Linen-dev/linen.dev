module.exports = async function (globalConfig, projectConfig) {
  const { client } = require('./src/utils/client');
  await client.collections(process.env.TYPESENSE_DATABASE).delete();
  if (globalThis.__KEY__.id) {
    await client.keys(globalThis.__KEY__.id).delete();
  }
};
