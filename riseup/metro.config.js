const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  enhanceMiddleware: (middleware) => (req, res, next) => {
    // Log the number of open files (for debugging purposes)
    console.log('Processing: ', req.url);
    return middleware(req, res, next);
  },
};

module.exports = config;
