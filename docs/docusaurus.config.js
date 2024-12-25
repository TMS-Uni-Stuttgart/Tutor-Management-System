module.exports = {
  title: 'Tutor-Management-System',
  url: 'https://tms-uni-stuttgart.github.io/',
  baseUrl: '/Tutor-Management-System/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'dudrie',
  projectName: 'Tutor-Management-System',
  plugins: ['docusaurus-plugin-sass'],
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
      copyright: `Copyright © ${new Date().getFullYear()}. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/Dudrie/Tutor-Management-System/edit/main/docs',
        },
        theme: {
          customCss: [require.resolve('./src/css/custom.scss')],
        },
      },
    ],
  ],
};
