export default defineAppConfig({
    ui: {
        colors: {
            primary: "blue",
            neutral: "slate"
        },
        button: {
            slots: {
                base: "cursor-pointer text-left disabled:opacity-50 aria-disabled:opacity-50 apaforum-button",
                // label: "whitespace-pre-line"
            }
        },
        navigationMenu: {
            slots: {
                linkLabel: 'apaforum-navigation-menu-link-label'
            },
            variants: {
                active: {
                    true: {
                        // link: 第一層選單項目（無子項目的選項）
                        link: 'before:!bg-white dark:before:bg-gray-800',
                        // childLink: 子選單項目（有 children 時的展開項目）
                        childLink: 'before:bg-white dark:before:bg-gray-800'
                    }
                }
            }
        },
        dashboardToolbar: {
            slots: {
                root: 'py-2'
            }
        },
        table: {
            slots: {
                base: 'table-fixed border-separate border-spacing-0',
                thead: 'sticky top-0 left-0 right-0 z-10 bg-default/75 backdrop-blur [&>tr]:bg-elevated/50 [&>tr]:after:content-none',
                tbody: '[&>tr]:last:[&>td]:border-b-0',
                th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r break-keep whitespace-pre-line text-left apaforum-table-th',
                td: 'border-b border-default whitespace-pre-wrap',
                separator: 'h-0'
            }
        },
        input: {
            slots: {
                root: 'w-full h-full',
                base: 'apaforum-input'
            }
        },
        formField: {
            slots: {
                label: 'whitespace-pre-line'
            }
        },
        textarea: {
            slots: {
                root: 'w-full'
            }
        }
    },
    colorMode: {
        preference: "light" // 可選：'system' | 'light' | 'dark'
    }
});
