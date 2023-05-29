import { useState } from "react";
import { View } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { GLView } from "expo-gl";
import Expo2DContext from "expo-2d-context";
import * as tf from "@tensorflow/tfjs";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { preprocess } from "../utils/preprocess";
import { renderBoxes } from "../utils/renderBox";

const TensorCamera = cameraWithTensors(Camera);

const CameraView = ({ type, model, inputTensorSize, config, children }) => {
  const [ctx, setCTX] = useState(null);
  const typesMapper = { back: CameraType.back, front: CameraType.front };

  const cameraStream = (images) => {
    const detectFrame = async () => {
      tf.engine().startScope();
      const [input, xRatio, yRatio] = preprocess(
        images.next().value,
        inputTensorSize[2],
        inputTensorSize[1]
      );

      await model.executeAsync(input).then((res) => {
        const [boxes, scores, classes] = res.slice(0, 3);
        const boxes_data = boxes.dataSync();
        const scores_data = scores.dataSync();
        const classes_data = classes.dataSync();

        renderBoxes(ctx, config.threshold, boxes_data, scores_data, classes_data, [xRatio, yRatio]);
        tf.dispose([res, input]);
      });

      requestAnimationFrame(detectFrame); // get another frame
      tf.engine().endScope();
    };

    detectFrame();
  };

  return (
    <>
      {ctx && (
        <TensorCamera
          // Standard Camera props
          className="w-full h-full z-0"
          type={typesMapper[type]}
          // Tensor related props
          //use_custom_shaders_to_resize={true}
          resizeHeight={inputTensorSize[1]}
          resizeWidth={inputTensorSize[2]}
          resizeDepth={inputTensorSize[3]}
          onReady={cameraStream}
          autorender={true}
        />
      )}
      <View className="absolute left-0 top-0 w-full h-full flex items-center bg-transparent z-10">
        <GLView
          className="w-full h-full "
          onContextCreate={async (gl) => {
            const ctx2d = new Expo2DContext(gl);
            await ctx2d.initializeText();
            setCTX(ctx2d);
          }}
        />
      </View>
      {children}
    </>
  );
};

export default CameraView;
