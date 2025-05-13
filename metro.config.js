const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve('stream-browserify'),
  crypto: require.resolve('crypto-browserify'),
  randombytes: require.resolve('react-native-randombytes'),
  assert: require.resolve('assert'),
  events: require.resolve('events'),
  util: require.resolve('util'),
  url: require.resolve('url'),
  http: require.resolve('react-native-http'),
  https: require.resolve('react-native-https'),
  net: path.resolve(__dirname, 'emptyModule.js'),
  ws: require.resolve('react-native-websocket'), // Replace ws with react-native-websocket
  tls: path.resolve(__dirname, 'emptyModule.js'),
  zlib: require.resolve('browserify-zlib'),
};

config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;