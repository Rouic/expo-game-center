module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/*.(test|spec).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo|@expo|expo-modules-core)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^react$': '<rootDir>/src/__tests__/__mocks__/react.js',
    '^react-native$': '<rootDir>/src/__tests__/__mocks__/react-native.js',
    '^expo-modules-core$': '<rootDir>/src/__tests__/__mocks__/expo-modules-core.js',
    '^expo$': '<rootDir>/src/__tests__/__mocks__/expo.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/__tests__/**/*',
    '!src/hooks/**/*', // Exclude hooks from coverage for now since they need React
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/setup.ts',
    '<rootDir>/src/__tests__/__mocks__/'
  ],
};