module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['eslint-comments', 'prettier'],
  env: {
    es2021: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'eslint-comments/no-unused-disable': 'error',
    'object-shorthand': ['error', 'always', {avoidQuotes: true}],
  },
  ignorePatterns: ['node_modules/', 'build/', '*.graphql.d.ts', '*.graphql.ts'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              String: {message: 'Use string instead', fixWith: 'string'},
              Boolean: {message: 'Use boolean instead', fixWith: 'boolean'},
              Number: {message: 'Use number instead', fixWith: 'number'},
              Object: {message: 'Use object instead', fixWith: 'object'},
              Array: {message: 'Provide a more specific type'},
              ReadonlyArray: {message: 'Provide a more specific type'},
            },
          },
        ],
      },
    },
  ],
};
