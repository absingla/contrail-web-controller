module.exports = {
    extends: 'eslint-config-airbnb-es5',
    installedESLint: true,
    rules: {
        semi: 0,
        'func-names': 0,
        indent: ['error', 4],
        'comma-dangle': ['error', 'always-multiline'],
        'space-before-function-paren': ['error', 'always'],
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-undefined': 0,
    },
    'globals': {
        '_': true,
        '$': true,
        'define': true,
        'globalObj': true,
    },
}
