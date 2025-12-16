/**
 * Główny layout aplikacji (Root Layout)
 * 
 * Ten plik opakowuje całą aplikację i:
 * - Inicjalizuje providery (UserProvider, RoutesProvider)
 * - Konfiguruje nawigację główną
 * - Ustawia kolory nagłówków zgodnie z motywem
 */

import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "../context/UserContext";
import { RoutesProvider } from "../context/RoutesContext";
import { OcrProvider } from "../context/OcrContext";
import { useActiveRouteNotification } from "../hooks/useActiveRouteNotification";

/**
 * Komponent wewnętrzny który inicjalizuje powiadomienia
 * Musi być WEWNĄTRZ RoutesProvider aby mieć dostęp do tras
 */
const AppContent = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    // Inicjalizuj obsługę powiadomień (tutaj mamy dostęp do RoutesContext)
    useActiveRouteNotification();
    
    return (
        <>
            <StatusBar style="auto" />
            
            <Stack 
                screenOptions={{
                    headerStyle: { backgroundColor: theme.navBackground},
                    headerTintColor: theme.title,
                }}
            > 
                <Stack.Screen 
                    name="index" 
                    options={{ headerShown: false}} 
                />
                
                <Stack.Screen 
                    name="(auth)" 
                    options={{ headerShown: false}} 
                />
                
                <Stack.Screen 
                    name="(dashboard)" 
                    options={{ headerShown: false}} 
                />
            </Stack>
        </>
    );
};

const RootLayout = () => {
    return (
        <UserProvider>
            <RoutesProvider>
                <OcrProvider>
                    <AppContent />
                </OcrProvider>
            </RoutesProvider>
        </UserProvider>
    );
};

export default RootLayout;
