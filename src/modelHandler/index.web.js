import * as tf from "@tensorflow/tfjs";

/**
 * loadModel for web.
 * Load model via static url. Copying model to static folder via copy-webpack-plugin
 * see webpack.config.js
 */
export const loadModel = async () => {
  const loadedModel = await tf.loadGraphModel(`${window.location.origin}/model/yolov5n/model.json`);
  return loadedModel;
};
