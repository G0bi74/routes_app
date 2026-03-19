import { TextInput, useColorScheme, View, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

const ThemedTextInput = ({ style, icon, ...props }) => {
  const colorScheme = useColorScheme();

  const theme = Colors[colorScheme] ?? Colors.light;

  if (icon) {
    return (
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.uiBackground },
          style,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={theme.iconColor}
          style={styles.icon}
        />
        <TextInput
          style={[styles.inputWithIcon, { color: theme.text }]}
          placeholderTextColor={theme.iconColor}
          {...props}
        />
      </View>
    );
  }

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.uiBackground,
          color: theme.text,
        },
        style,
      ]}
      placeholderTextColor={theme.iconColor}
      {...props}
    />
  );
};

export default ThemedTextInput;

const styles = StyleSheet.create({
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  icon: {
    marginRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },
});
