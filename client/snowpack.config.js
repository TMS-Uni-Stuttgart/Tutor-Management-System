/** @type { import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',
    '../server/src/shared': '/shared',
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
    [
      './plugins/snowpack-pug.js',
      {
        file: 'index.pug',
        excludePugFromBuild: true,
        locals: {
          dev: { ROUTE_PREFIX: '' },
          build: { ROUTE_PREFIX: '${ROUTE_PREFIX}' },
        },
      },
    ],
    [
      '@snowpack/plugin-webpack',
      {
        // We need to keep comments in the HTML to support the prefix option of the server.
        htmlMinifierOptions: { removeComments: false },
      },
    ],
    ['./plugins/snowpack-prefix-support.js', { prefix: '${ROUTE_PREFIX}' }],
  ],
  install: [],
  installOptions: {
    polyfillNode: true,
    namedExports: ['class-transformer', 'lodash'],
  },
  devOptions: {
    port: 3000,
    open: 'none',
  },
  buildOptions: {},
  proxy: {
    '/api': 'http://localhost:8080/api',
  },
  alias: {
    shared: '../server/src/shared',
  },
};
