/**
 * O Expo (via `babel-preset-expo`) resolve `expo/*` a partir da raiz do monorepo,
 * onde não há essa dependência. Este patch faz o Node procurar também em
 * `apps/mobile/node_modules` antes de desistir.
 */
const Module = require('module');
const path = require('path');

const appModules = path.join(__dirname, 'node_modules');
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function patchedResolve(request, parent, ...rest) {
  try {
    return originalResolve.call(this, request, parent, ...rest);
  } catch (error) {
    return originalResolve.call(this, request, { ...parent, paths: [appModules, ...(parent?.paths ?? [])] }, ...rest);
  }
};
