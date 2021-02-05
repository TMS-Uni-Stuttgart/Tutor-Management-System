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
            items: parseHandbookItems(['introduction', 'login', 'dashboard', 'navigation']),
        },
        {
            type: 'category',
            label: 'Tutorial',
            collapsed: false,
            items: parseHandbookItems([
                'student_management',
                'team_management',
                'substitutes',
                'student_info',
            ]),
        },
        {
            type: 'category',
            label: 'Gradings',
            collapsed: false,
            items: [
                ...parseHandbookItems([
                    'attendances',
                    'sheet_gradings',
                    'scheinexam_gradings',
                    'presentations',
                ]),
            ],
        },
        {
            type: 'category',
            label: 'Internal',
            collapsed: false,

            items: parseHandbookItems([
                'user_management',
                'tutorial_management',
                'student_overview',
                'hand_ins',
                'criterias',
                'settings',
                'roles',
            ]),
        },
    ],
    dev: ['dev/setup-env', 'dev/server-doc', 'dev/structure', 'dev/fork'],
};
