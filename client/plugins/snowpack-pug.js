/* eslint-disable @typescript-eslint/no-var-requires */
const pug = require('pug');
const fs = require('fs');

/**
 * @type { import('snowpack').SnowpackPluginFactory<{
 *  file?: string,
 *  locals?: {
 *    dev?: Record<string, string>,
 *    build?: Record<string, string>,
 *  }
 * }> }
 */
module.exports = function (_, pluginOptions) {
  return {
    name: 'dudrie/snowpack-pug',
    resolve: {
      input: ['.pug'],
      output: ['.html'],
    },
    config(snowpackConfig) {
      const fallback = pluginOptions.file || 'index.pug';
      snowpackConfig.devOptions.fallback = fallback;
    },
    load({ filePath, isDev }) {
      const { locals } = pluginOptions;
      const template = fs.readFileSync(filePath).toString();
      const render = pug.compile(template);
      const options = isDev ? locals.dev : locals.build;

      return {
        '.html': { code: render(options ?? {}) },
      };
    },
  };
};
