const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add custom resolver for path aliases
config.resolver = {
  ...config.resolver,
  sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
  extraNodeModules: {
    '@': path.resolve(__dirname),
    '@components': path.resolve(__dirname, 'components'),
    '@screens': path.resolve(__dirname, 'app'),
    '@constants': path.resolve(__dirname, 'constants'),
    '@services': path.resolve(__dirname, 'services'),
    '@utils': path.resolve(__dirname, 'utils'),
    '@hooks': path.resolve(__dirname, 'hooks'),
    '@contexts': path.resolve(__dirname, 'contexts'),
    '@types': path.resolve(__dirname, 'types'),
    '@assets': path.resolve(__dirname, 'assets'),
  },
};

module.exports = config; 