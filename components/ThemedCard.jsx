import { StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "../constants/Colors";

const ThemedCard = ({ style, elevated = true, ...props }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.uiBackground },
        elevated && (isDark ? styles.elevatedDark : styles.elevatedLight),
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  elevatedLight: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  elevatedDark: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
