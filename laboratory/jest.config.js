module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@libs/(.*)$': '<rootDir>/libs/$1',
    '^@apps/(.*)$': '<rootDir>/apps/$1',
    '^@env/(.*)$': '<rootDir>/env/$1',
  },
};
