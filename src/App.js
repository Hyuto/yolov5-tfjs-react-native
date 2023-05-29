import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Camera } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { modelURI } from "./modelHandler";
import CameraView from "./CameraView";

const App = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState("back");
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [inputTensor, setInputTensor] = useState([]);

  // model configuration
  const configurations = { threshold: 0.25 };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      tf.ready().then(async () => {
        const yolov5 = await tf.loadGraphModel(modelURI, {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }); // load model

        // warming up model
        const dummyInput = tf.ones(yolov5.inputs[0].shape);
        await yolov5.executeAsync(dummyInput);
        tf.dispose(dummyInput);

        // set state
        setInputTensor(yolov5.inputs[0].shape);
        setModel(yolov5);
        setLoading({ loading: false, progress: 1 });
      });
    })();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      {hasPermission ? (
        <>
          {loading.loading ? (
            <Text className="text-lg">Loading model... {(loading.progress * 100).toFixed(2)}%</Text>
          ) : (
            <View className="flex-1 w-full h-full">
              <View className="flex-1 w-full h-full items-center justify-center">
                <CameraView
                  type={type}
                  model={model}
                  inputTensorSize={inputTensor}
                  config={configurations}
                >
                  <View className="absolute left-0 top-0 w-full h-full flex justify-end items-center bg-transparent z-20">
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
                </CameraView>
              </View>
            </View>
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
