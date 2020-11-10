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
    ['./plugins/snowpack-pug.js', { file: 'index.pug' }],
    '@snowpack/plugin-webpack',
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
