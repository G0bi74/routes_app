import { View, StyleSheet, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "./ThemedText";
import { Colors } from "../constants/Colors";

const ThemedTile = ({
  icon,
  label,
  value,
  color,
  fullWidth = false,
  style,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const iconColor = color || Colors.primary;

  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: theme.uiBackground },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
      )}
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
  );
};

export default ThemedTile;

const styles = StyleSheet.create({
  tile: {
    width: "48%",
    flexGrow: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  fullWidth: {
    width: "100%",
  },
  iconContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
    textAlign: "center",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
