const pug = require('pug');
const fs = require('fs');

/**
 * @type { import('snowpack').SnowpackPluginFactory<{ file?: string }> }
 */
module.exports = function (_, pluginOptions) {
  return {
    name: 'dudrie/snowpack-pug',
    resolve: {
      input: ['.pug'],
      output: ['.html', '.pug'],
    },
    config(snowpackConfig) {
      const fallback = pluginOptions.file || 'index.pug';
      snowpackConfig.devOptions.fallback = fallback;
    },
    async load({ filePath, isDev }) {
      const template = fs.readFileSync(filePath).toString();

      if (isDev) {
        return { '.html': pug.render(template) };
      } else {
        return { '.pug': template, '.html': pug.render(template) };
      }
    },
  };
};
