const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ["nativewind", "@tensorflow"],
      },
    },
    argv
  );

  config.module.rules.push({
    test: /\.css$/i,
    use: ["postcss-loader"],
  });

  // Copy model to static file
  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [{ from: "assets/model", to: "model" }],
    })
  );

  return config;
};
