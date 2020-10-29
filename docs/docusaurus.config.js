module.exports = {
  title: 'Tutor-Management-System',
  // tagline: "The tagline of my site",
  url: 'https://dudrie.github.io/',
  baseUrl: '/Tutor-Management-System/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'dudrie', // Usually your GitHub org/user name.
  projectName: 'Tutor-Management-System', // Usually your repo name.
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
      // items: [
      //   {
      //     to: 'docs/setup/installation',
      //     activeBasePath: 'docs',
      //     label: 'Docs',
      //     position: 'left',

      //   },
      //   {
      //     href: 'https://github.com/Dudrie/Tutor-Management-System',
      //     label: 'GitHub',
      //     position: 'right',
      //   },
      // ],
    },
    footer: {
      style: 'dark',
      // links: [
      //   {
      //     title: "Docs",
      //     items: [
      //       {
      //         label: "Style Guide",
      //         to: "docs/",
      //       },
      //       {
      //         label: "Second Doc",
      //         to: "docs/doc2/",
      //       },
      //     ],
      //   },
      //   {
      //     title: "Community",
      //     items: [
      //       {
      //         label: "Stack Overflow",
      //         href: "https://stackoverflow.com/questions/tagged/docusaurus",
      //       },
      //       {
      //         label: "Discord",
      //         href: "https://discordapp.com/invite/docusaurus",
      //       },
      //       {
      //         label: "Twitter",
      //         href: "https://twitter.com/docusaurus",
      //       },
      //     ],
      //   },
      //   {
      //     title: "More",
      //     items: [
      //       // {
      //       //   label: "Blog",
      //       //   to: "blog",
      //       // },
      //       {
      //         label: "GitHub",
      //         href: "https://github.com/facebook/docusaurus",
      //       },
      //     ],
      //   },
      // ],
      copyright: `Copyright © ${new Date().getFullYear()}. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
