import { ActivityIndicator } from "react-native";
import { Colors } from "../constants/Colors";
import ThemedView from "../components/ThemedView";

const ThemedLoader = () => {
  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
    </ThemedView>
  );
};

export default ThemedLoader;
