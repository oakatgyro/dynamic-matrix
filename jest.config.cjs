// See: https://jestjs.io/docs/configuration

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageReporters: ['json-summary', 'text', 'lcov'],
  // Uncomment the below lines if you would like to enforce a coverage threshold
  // for your action. This will fail the build if the coverage is below the
  // specified thresholds.
  // coverageThreshold: {
  //   global: {
  //     branches: 100,
  //     functions: 100,
  //     lines: 100,
  //     statements: 100
  //   }
  // },
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  preset: 'ts-jest/presets/default-esm',
  reporters: ['default'],
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.eslint.json',
        useESM: true
      }
    ]
  },
  verbose: true
}
