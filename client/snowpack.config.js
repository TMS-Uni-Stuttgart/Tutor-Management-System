/* eslint-disable @typescript-eslint/no-var-requires */
const httpProxy = require('http-proxy');
const apiProxy = httpProxy.createServer({
  target: 'http://localhost:8080',
  // Don't verify the SSL certs (not needed during development)
  secure: false,
  // Change the URL of the request to match the target (and not the one of the client dev server)
  changeOrigin: true,
});

/** @type { import("snowpack").SnowpackUserConfig } */
module.exports = {
  root: './',
  mount: {
    public: '/',
    src: '/_dist_',
    '../server/src/shared': '/shared',
  },
  routes: [
    {
      src: '/api/.*',
      dest: (req, res) => apiProxy.web(req, res),
    },
    {
      match: 'routes',
      src: '.*',
      dest: '/index.html',
    },
  ],
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    [
      './plugins/snowpack-pug.js',
      {
        file: 'index.pug',
        locals: {
          dev: { ROUTE_PREFIX: '' },
          build: { ROUTE_PREFIX: '${ROUTE_PREFIX}' },
        },
      },
    ],
    '@snowpack/plugin-typescript',
    [
      '@snowpack/plugin-webpack',
      {
        // We need to keep comments in the HTML to support the prefix option of the server.
        htmlMinifierOptions: { removeComments: false },
      },
    ],
    ['./plugins/snowpack-prefix-support.js', { prefix: '${ROUTE_PREFIX}' }],
  ],
  alias: {
    shared: '../server/src/shared',
  },
  devOptions: {
    port: 3000,
    open: 'none',
  },
  packageOptions: {
    polyfillNode: true,
    namedExports: ['class-transformer', 'lodash'],
    knownEntrypoints: ['@material-ui/system'],
  },
  buildOptions: {},
};
