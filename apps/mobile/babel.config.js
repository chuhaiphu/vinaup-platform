module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // must have for react-native-reanimated
    plugins: ['react-native-worklets/plugin'],
  };
};
