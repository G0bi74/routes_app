import { View, StyleSheet, useColorScheme } from "react-native";
import ThemedText from "./ThemedText";
import { Colors } from "../constants/Colors";

const ThemedDivider = ({ text, style }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (text) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.line, isDark && styles.lineDark]} />
        <ThemedText style={styles.text}>{text}</ThemedText>
        <View style={[styles.line, isDark && styles.lineDark]} />
      </View>
    );
  }

  return <View style={[styles.simpleLine, isDark && styles.lineDark, style]} />;
};

export default ThemedDivider;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
    opacity: 0.5,
  },
  lineDark: {
    backgroundColor: "#555",
  },
  simpleLine: {
    height: 1,
    backgroundColor: "#ddd",
    opacity: 0.3,
    marginVertical: 12,
  },
  text: {
    marginHorizontal: 12,
    fontSize: 12,
    opacity: 0.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
