const { prisma } = require('@linen/database');

module.exports = async function (globalConfig, projectConfig) {
  await prisma.$disconnect();
};
