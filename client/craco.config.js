/* eslint-disable @typescript-eslint/no-var-requires */
const CracoAlias = require('craco-alias');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolvePath = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  webpack: {
    configure: (config, { env: webpackEnv }) => {
      const isEnvProduction = webpackEnv === 'production';
      const loader = {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        include: resolvePath('../server/src/shared'),
        loader: require.resolve('babel-loader'),
        options: {
          presets: ['react-app'],
          customize: require.resolve('babel-preset-react-app/webpack-overrides'),
          plugins: [
            [
              require.resolve('babel-plugin-named-asset-import'),
              {
                loaderMap: {
                  svg: {
                    ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                  },
                },
              },
            ],
          ],
          cacheDirectory: true,
          cacheCompression: false,
          compact: isEnvProduction,
        },
      };

      config.module.rules.forEach(rule => {
        if (typeof rule.oneOf !== 'undefined') {
          rule.oneOf.splice(rule.oneOf.length - 2, 0, loader);
        }
      });

      config.resolve.plugins = config.resolve.plugins.filter(
        plugin => !(plugin instanceof ModuleScopePlugin)
      );

      return config;
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: './src',
        tsConfigPath: './tsconfig.extends.json',
      },
    },
  ],
};
