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

const RootLayout = () => {
    // Pobieranie aktualnego motywu systemowego
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    return (
        // Provider dla użytkownika - udostępnia dane użytkownika w całej aplikacji
        <UserProvider>
            {/* Provider dla tras - udostępnia trasy w całej aplikacji */}
            <RoutesProvider>
                {/* Provider dla OCR - rozpoznawanie tekstu ze zdjęć */}
                <OcrProvider>
                    {/* Pasek statusu */}
                    <StatusBar style="auto" />
                    
                    {/* Stack Navigator - główna nawigacja */}
                    <Stack 
                        screenOptions={{
                            headerStyle: { backgroundColor: theme.navBackground},
                            headerTintColor: theme.title,
                        }}
                    > 
                        {/* Strona główna */}
                        <Stack.Screen 
                            name="index" 
                            options={{ title: 'Strona Główna'}} 
                        />
                        
                        {/* Sekcja autoryzacji (login, register) */}
                        <Stack.Screen 
                            name="(auth)" 
                            options={{ headerShown: false}} 
                        />
                        
                        {/* Sekcja dashboard (profile, history, create) */}
                        <Stack.Screen 
                            name="(dashboard)" 
                            options={{ headerShown: false}} 
                        />
                    </Stack>
                </OcrProvider>
            </RoutesProvider>
        </UserProvider>
    );
}

export default RootLayout;
