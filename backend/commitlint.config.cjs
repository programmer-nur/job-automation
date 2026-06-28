module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'chore', 'docs', 'test', 'perf', 'style', 'ci'],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'always', ['lower-case']],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
  },
};
