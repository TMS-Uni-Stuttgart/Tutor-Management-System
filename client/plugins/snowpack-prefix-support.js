/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

/**
 * @type { import('snowpack').SnowpackPluginFactory<{
 *  prefix: string;
 * }> }
 */
module.exports = function (_, pluginOptions) {
  return {
    name: 'dudrie/snowpack-prefix-support',
    async optimize({ buildDirectory }) {
      const { prefix } = pluginOptions;
      const indexPath = path.resolve(buildDirectory, 'index.html');

      try {
        const content = fs.readFileSync(indexPath, { encoding: 'utf-8' }).toString();
        const changedContent = content
          .replace(/"\/css/g, `"${prefix}/css`)
          .replace(/"\/js/g, `"${prefix}/js`);

        fs.writeFileSync(indexPath, changedContent, { encoding: 'utf-8' });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Could not change index.html file ("${indexPath}")`);
        throw err;
      }
    },
  };
};
