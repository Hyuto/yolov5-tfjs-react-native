import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import "./styles";

const App = () => {
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
