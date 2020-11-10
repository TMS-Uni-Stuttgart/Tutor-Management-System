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
      output: ['.html', '.pug'],
    },
    config(snowpackConfig) {
      const fallback = pluginOptions.file || 'index.pug';
      snowpackConfig.devOptions.fallback = fallback;
    },
    async load({ filePath, isDev }) {
      const { locals } = pluginOptions;
      const template = fs.readFileSync(filePath).toString();

      if (isDev) {
        return { '.html': pug.render(template, { ...locals.dev }) };
      } else {
        return { '.pug': template, '.html': pug.render(template, { ...locals.build }) };
      }
    },
  };
};
