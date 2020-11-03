function parseHandbookItems(items) {
  return items.map((p) => `handbook/${p}`);
}

module.exports = {
  setup: ['setup/installation', 'setup/configuration', 'setup/update', 'setup/nginx'],
  handbook: [
    {
      type: 'category',
      label: 'General',
      collapsed: false,
      items: parseHandbookItems(['introduction', 'login', 'dashboard']),
    },
    {
      type: 'category',
      label: 'Tutorial',
      collapsed: false,
      items: parseHandbookItems(['student_management', 'team_management', 'substitutes']),
    },
    {
      type: 'category',
      label: 'Gradings',
      collapsed: false,
      items: [
        // {
        //   type: 'category',
        //   label: 'Sheets',
        //   items: parseHandbookItems(['point_overview']),
        // },
        ...parseHandbookItems(['sheet_grading', 'attendances', 'presentations']),
      ],
    },
    {
      type: 'category',
      label: 'Internal',
      collapsed: false,

      items: parseHandbookItems([
        'user_management',
        'tutorial_management',
        'hand_ins',
        'criterias',
        'settings',
        'roles',
      ]),
    },
  ],
  dev: ['dev/setup-env', 'dev/fork'],
};
