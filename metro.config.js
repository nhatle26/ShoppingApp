const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  watchFolders: [
    path.resolve('D:/IT/ReactNative24pnv1a/node_modules'),
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve('D:/IT/ReactNative24pnv1a/node_modules'),
    ],
    blockList: [/D:[/\\]IT[/\\]Shop[/\\]node_modules/],
  },
};

module.exports = mergeConfig(defaultConfig, config);
