import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import "./styles";

const App = () => {
  useEffect(() => {
    tf.ready().then(() => {
      console.log("Tensorflow Ready!");
      console.log(tf.getBackend());
    });
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg">
        Hello from <Text className="italic font-bold">src/App.js</Text>
      </Text>
      <StatusBar style="auto" />
    </View>
  );
};

export default App;
