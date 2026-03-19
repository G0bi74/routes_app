import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import GuestsOnly from "../../components/auth/GuestsOnly";

export default function AuthLayout() {
  return (
    <GuestsOnly>
      {}
      <StatusBar style="auto" />

      {}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      />
    </GuestsOnly>
  );
}
