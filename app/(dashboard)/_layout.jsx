/**
 * Layout dla sekcji Dashboard (główna część aplikacji)
 * 
 * Ten layout opakowuje wszystkie strony dla zalogowanych użytkowników:
 * - Profil (profile)
 * - Historia tras (history)
 * - Tworzenie trasy (create)
 * - Szczegóły trasy (routes/[id])
 * 
 * Używa komponentu UserOnly do ochrony - tylko zalogowani użytkownicy
 * mogą zobaczyć te strony
 */

import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserOnly from "../../components/auth/UserOnly";

const DashboardLayout = () => {
    // Pobieranie aktualnego motywu systemowego
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <UserOnly>
            {/* Nawigacja dolna (tabs) */}
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: theme.navBackground,
                        paddingTop: 10,
                        height: 90
                    },
                    tabBarActiveTintColor: theme.iconColorFocused,    // Kolor aktywnej ikony
                    tabBarInactiveTintColor: theme.iconColor          // Kolor nieaktywnej ikony
                }}
            >
                {/* Zakładka Profil */}
                <Tabs.Screen 
                    name="profile" 
                    options={{
                        title: "Profil", 
                        tabBarIcon: ({ focused }) => (
                            <Ionicons
                                size={24}
                                name={focused ? 'person' : "person-outline"}
                                color={focused ? theme.iconColorFocused: theme.iconColor}
                            />
                        )
                    }}
                />
                
                {/* Zakładka Historia Tras */}
                <Tabs.Screen 
                    name="history" 
                    options={{
                        title: "Historia", 
                        tabBarIcon: ({ focused }) => (
                            <Ionicons
                                size={24}
                                name={focused ? 'list' : "list-outline"}
                                color={focused ? theme.iconColorFocused: theme.iconColor}
                            />
                        )
                    }}
                />
                
                {/* Zakładka Tworzenie Trasy */}
                <Tabs.Screen 
                    name="create" 
                    options={{
                        title: "Utwórz", 
                        tabBarIcon: ({ focused }) => (
                            <Ionicons
                                size={24}
                                name={focused ? 'add-circle' : "add-circle-outline"}
                                color={focused ? theme.iconColorFocused: theme.iconColor}
                            />
                        )
                    }}
                />
                
                {/* Ekran szczegółów trasy - ukryty w nawigacji (href: null) */}
                <Tabs.Screen 
                    name="routes/[id]" 
                    options={{href: null}}  // Nie pokazuj w nawigacji dolnej
                />
            </Tabs>
        </UserOnly>
    );
}

export default DashboardLayout;
