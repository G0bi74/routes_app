import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserOnly from "../../components/auth/UserOnly";

const DashboardLayout = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <UserOnly>
      {}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.navBackground,
            paddingTop: 10,
            height: 90,
          },
          tabBarActiveTintColor: theme.iconColorFocused,
          tabBarInactiveTintColor: theme.iconColor,
        }}
      >
        {}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profil",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "person" : "person-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />

        {}
        <Tabs.Screen
          name="history"
          options={{
            title: "Historia",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "list" : "list-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />

        {}
        <Tabs.Screen
          name="create"
          options={{
            title: "Utwórz",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={24}
                name={focused ? "add-circle" : "add-circle-outline"}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />

        {}
        <Tabs.Screen name="routes/[id]" options={{ href: null }} />
      </Tabs>
    </UserOnly>
  );
};

export default DashboardLayout;
