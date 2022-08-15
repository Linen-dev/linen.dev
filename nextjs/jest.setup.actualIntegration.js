const { seed } = require('./bin/factory');

let hasRun = false;

module.exports = async () => {
  // if (hasRun) return; // avoid rerun the seed if running jest with watch
  // hasRun = true;
  // console.log('seed...');
  // await seed();
  // console.log('seed finished');
};
