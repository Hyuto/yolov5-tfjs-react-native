import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Camera } from "expo-camera";
import { GLView } from "expo-gl";
import Expo2DContext from "expo-2d-context";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { loadModel } from "./modelHandler";
import CameraView from "./CameraView";

const App = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState("back");
  const [model, setModel] = useState(null);
  const [inputTensor, setInputTensor] = useState([]);
  const [ctx, setCTX] = useState(null);

  // model configuration
  const configurations = { threshold: 0.25 };

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
                  <CameraView
                    type={type}
                    model={model}
                    inputTensorSize={inputTensor}
                    ctx={ctx}
                    config={configurations}
                  />
                )}
              </View>
              <View className="absolute z-80 left-0 top-0 w-full h-full flex items-center bg-transparent">
                <GLView
                  className="w-full h-full"
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
                  onPress={() => setType((current) => (current === "back" ? "front" : "back"))}
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
