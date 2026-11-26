const path = require('path');

module.exports = {
  preset: '<rootDir>/jest-preset',
  rootDir: __dirname,
  setupFiles: ['<rootDir>/jest.setup-node-path.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // O preset do Expo é resolvido da raiz do monorepo; os pacotes do app ficam
  // em `apps/mobile/node_modules`, então o Jest precisa olhar para lá primeiro.
  modulePaths: [path.join(__dirname, 'node_modules')],
  moduleDirectories: ['node_modules', path.join(__dirname, 'node_modules')],
  haste: { retainAllFiles: false },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@aurora/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind))',
  ],
};
