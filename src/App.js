import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { loadModel } from "./modelHandler";
import "./styles";

/* 
TODO:
- Make separate camera view for android and web
- Make separate detection function for android and web
- use callbacks and memo for better computation
 */

const TensorCamera = cameraWithTensors(Camera);

const App = () => {
  const [model, setModel] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(CameraType.back);

  // Model Config
  const [modelWidth, modelHeight] = [640, 640];

  const cameraStream = (images) => {
    /**
     * Function to detect every frame loaded from webcam in video tag.
     * @param {tf.GraphModel} model loaded YOLOv5 tensorflow.js model
     */
    const detectFrame = async () => {
      tf.engine().startScope();
      const input = tf.tidy(() => {
        return tf.image
          .resizeBilinear(images.next().value, [modelWidth, modelHeight])
          .div(255.0)
          .expandDims(0);
      });

      await model.executeAsync(input).then((res) => {
        const [boxes, scores, classes] = res.slice(0, 3);
        const boxes_data = boxes.dataSync();
        const scores_data = scores.dataSync();
        const classes_data = classes.dataSync();
        console.log(boxes_data);
        // TODO: implements box rendering
        //renderBoxes(canvasRef, threshold, boxes_data, scores_data, classes_data);
        tf.dispose(res);
      });

      requestAnimationFrame(detectFrame); // get another frame
      tf.engine().endScope();
    };

    detectFrame();
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      tf.ready().then(() => {
        loadModel().then((loadedModel) => {
          setModel(loadedModel);
        });
      });
    })();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      {model ? (
        <>
          {hasPermission ? (
            <View className="flex-1 w-full h-full">
              <View className="flex-1 w-full h-full z-0 items-center">
                <TensorCamera
                  // Standard Camera props
                  className="w-full max-w-screen-sm h-full"
                  type={type}
                  // Tensor related props
                  use_custom_shaders_to_resize={true}
                  resizeHeight={640}
                  resizeWidth={640}
                  resizeDepth={3}
                  onReady={cameraStream}
                  autorender={true}
                />
              </View>
              <View className="absolute z-100 left-0 top-0 w-full h-full flex justify-end items-center bg-transparent">
                <TouchableOpacity
                  className="flex flex-row items-center bg-transparent border-2 border-white p-3 mb-10 rounded-lg"
                  onPress={() =>
                    setType((current) =>
                      current === CameraType.back ? CameraType.front : CameraType.back
                    )
                  }
                >
                  <MaterialCommunityIcons
                    className="mx-2"
                    name="camera-flip"
                    size={30}
                    color="white"
                  />
                  <Text className="mx-2 text-white text-lg font-semibold">Flip Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text className="text-lg">Permission not granted!</Text>
          )}
        </>
      ) : (
        <View>
          <Text className="text-lg">Loading model...</Text>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

export default App;
