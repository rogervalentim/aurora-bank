const path = require('path');
const expoPreset = require('jest-expo/jest-preset');

/**
 * Preset do Expo ajustado para o monorepo: o React Native e o React usados nos
 * testes são os de `apps/mobile/node_modules`, não os hoisted da raiz.
 */
const appModules = path.join(__dirname, '..', 'node_modules');

module.exports = {
  ...expoPreset,
  modulePathIgnorePatterns: [
    path.join(appModules, 'jest-expo', 'node_modules'),
    path.join(appModules, 'expo', 'node_modules'),
  ],
  modulePaths: [appModules],
  moduleDirectories: ['node_modules', appModules],
  moduleNameMapper: {
    ...expoPreset.moduleNameMapper,
    '^react-native$': path.join(appModules, 'react-native'),
    '^react-native/(.*)$': path.join(appModules, 'react-native', '$1'),
    // Caminhos relativos usados pelo setup/índice do React Native precisam ser
    // resolvidos a partir de `apps/mobile/node_modules/react-native`.
    '^\\.\\./Libraries/Image/Image$': path.join(appModules, 'react-native', 'Libraries', 'Image', 'Image.ios'),
    '^\\./Libraries/Utilities/Platform$': path.join(appModules, 'react-native', 'Libraries', 'Utilities', 'Platform.ios'),
  },
};
