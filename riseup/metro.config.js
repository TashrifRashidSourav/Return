const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add `.cjs` to the resolver extensions for react-native-reanimated
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'cjs');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Include middleware logging (your existing code)
config.server = {
  enhanceMiddleware: (middleware) => (req, res, next) => {
    console.log('Processing: ', req.url);
    return middleware(req, res, next);
  },
};

module.exports = config;
