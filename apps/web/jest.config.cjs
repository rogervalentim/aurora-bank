/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css)$': '<rootDir>/src/__tests__/__mocks__/style-mock.cjs',
    '^lucide-react$': '<rootDir>/src/__tests__/__mocks__/lucide-mock.cjs',
    '^@aurora/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          target: 'ES2022',
          module: 'CommonJS',
          moduleResolution: 'Node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          noUncheckedIndexedAccess: true,
          exactOptionalPropertyTypes: true,
          skipLibCheck: true,
          verbatimModuleSyntax: false,
          isolatedModules: true,
          baseUrl: '.',
          paths: { '@/*': ['./src/*'] },
        },
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@aurora/shared)/)'],
  clearMocks: true,
};
