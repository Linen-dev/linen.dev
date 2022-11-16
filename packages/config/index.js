const { join } = require('path');

function addPackagesPathToSwcLoader(rule) {
  if (rule.oneOf) {
    rule.oneOf = rule.oneOf.map((setup) => {
      if (setup?.use?.loader === 'next-swc-loader') {
        const path = join(__dirname, '../ui');
        if (!setup.include.includes(path)) {
          setup.include.push(path);
        }
      }
      return setup;
    });
  }
}

module.exports = { addPackagesPathToSwcLoader };
