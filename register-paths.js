// register-paths.js
const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.build.json');
const path = require('path');

// Adjust the baseUrl to point to the compiled "dist" folder
tsConfigPaths.register({
  baseUrl: path.resolve(__dirname, 'dist'),
  paths: tsConfig.compilerOptions.paths,
});
