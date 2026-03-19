import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "../context/UserContext";
import { RoutesProvider } from "../context/RoutesContext";
import { OcrProvider } from "../context/OcrContext";
import { AlertProvider } from "../components/ThemedAlert";
import { useActiveRouteNotification } from "../hooks/useActiveRouteNotification";

const AppContent = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  useActiveRouteNotification();

  return (
    <>
      <StatusBar style="auto" />

      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.navBackground },
          headerTintColor: theme.title,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

const RootLayout = () => {
  return (
    <AlertProvider>
      <UserProvider>
        <RoutesProvider>
          <OcrProvider>
            <AppContent />
          </OcrProvider>
        </RoutesProvider>
      </UserProvider>
    </AlertProvider>
  );
};

export default RootLayout;
