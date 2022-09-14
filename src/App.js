import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { GLView } from "expo-gl";
import Expo2DContext from "expo-2d-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { loadModel } from "./modelHandler";
import { renderBoxes } from "./utils/renderBox";

const TensorCamera = cameraWithTensors(Camera);

const App = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const [model, setModel] = useState(null);
  const [inputTensor, setInputTensor] = useState([]);
  const [ctx, setCTX] = useState(null);

  // model configuration
  const threshold = 0.25;

  const cameraStream = (images) => {
    const detectFrame = async () => {
      tf.engine().startScope();
      const input = tf.tidy(() => {
        return tf.image
          .resizeBilinear(images.next().value, [inputTensor[1], inputTensor[2]])
          .div(255.0)
          .expandDims(0);
      });

      await model.executeAsync(input).then(async (res) => {
        const [boxes, scores, classes] = res.slice(0, 3);
        const boxes_data = boxes.dataSync();
        const scores_data = scores.dataSync();
        const classes_data = classes.dataSync();
        renderBoxes(ctx, threshold, boxes_data, scores_data, classes_data);

        tf.dispose([res, input]);
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
        loadModel().then(async (loadedModel) => {
          // warming up model
          const dummyInput = tf.ones(loadedModel.inputs[0].shape);
          await loadedModel.executeAsync(dummyInput);
          tf.dispose(dummyInput);

          // set state
          setInputTensor(loadedModel.inputs[0].shape);
          setModel(loadedModel);
        });
      });
    })();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      {hasPermission ? (
        <>
          {model ? (
            <View className="flex-1 w-full h-full">
              <View className="flex-1 w-full h-full z-0 items-center">
                {ctx && (
                  <TensorCamera
                    // Standard Camera props
                    className="w-full max-w-screen-sm h-full"
                    type={type}
                    // Tensor related props
                    //use_custom_shaders_to_resize={true}
                    resizeHeight={inputTensor[1]}
                    resizeWidth={inputTensor[2]}
                    resizeDepth={inputTensor[3]}
                    onReady={cameraStream}
                    autorender={true}
                  />
                )}
              </View>
              <View className="absolute z-80 left-0 top-0 w-full h-full flex items-center bg-transparent">
                <GLView
                  className="w-full max-w-screen-sm h-full"
                  onContextCreate={async (gl) => {
                    const ctx2d = new Expo2DContext(gl);
                    await ctx2d.initializeText();
                    setCTX(ctx2d);
                  }}
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
            <Text className="text-lg">Loading model...</Text>
          )}
        </>
      ) : (
        <View>
          <Text className="text-lg">Permission not granted!</Text>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

export default App;
