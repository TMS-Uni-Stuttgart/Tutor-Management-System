module.exports = {
  title: 'Tutor-Management-System',
  url: 'https://dudrie.github.io/',
  baseUrl: '/Tutor-Management-System/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'dudrie',
  projectName: 'Tutor-Management-System',
  themeConfig: {
    colorMode: {
      // Should we use the prefers-color-scheme media-query,
      // using user system preferences, instead of the hardcoded defaultMode
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'TMS Documentation',
      logo: {
        alt: 'TMS Documentation Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/handbook/introduction',
          activeBasePath: 'docs/handbook',
          position: 'left',
          label: 'Handbook',
        },
        {
          to: 'docs/setup/installation',
          activeBasePath: 'docs/setup',
          position: 'left',
          label: 'Setup',
        },
        {
          to: 'docs/dev/setup-env',
          activeBasePath: 'docs/dev',
          position: 'left',
          label: 'Development',
        },
        {
          href: 'https://github.com/Dudrie/Tutor-Management-System',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()}. Built with Docusaurus. (Test deploy)`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // TODO: Replace branch with "main" before merging into main branch!
          editUrl: 'https://github.com/Dudrie/Tutor-Management-System/edit/add-documentation/docs',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
