import { loadGraphModel } from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";

const modelJson = require("../../assets/yolov5n/model.json");
const modelWeights = [
  require("../../assets/yolov5n/group1-shard1of2.bin"),
  require("../../assets/yolov5n/group1-shard2of2.bin"),
];

/**
 * loadModel for Android and IOS
 * loading model via bundleResourceIO and assets
 */
export const loadModel = async () => {
  const loadedModel = await loadGraphModel(bundleResourceIO(modelJson, modelWeights));
  return loadedModel;
};
