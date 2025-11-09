/**
 * Komponent ThemedView - Kontener dostosowany do motywu aplikacji
 * 
 * Automatycznie zmienia kolor tła w zależności od motywu systemowego
 * Opcjonalnie uwzględnia safe area (bezpieczny obszar) urządzenia
 */

import { View, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * @param {Object} style - Dodatkowe style
 * @param {boolean} safe - Czy uwzględnić safe area (wcięcia notch, przyciski systemowe)
 * @param {Object} props - Inne właściwości przekazywane do View
 */
const ThemedView = ({style, safe = false, ...props}) => {
    // Pobieranie aktualnego motywu systemowego
    const colorScheme = useColorScheme();
    
    // Wybór palety kolorów
    const theme = Colors[colorScheme] ?? Colors.light;

    // Jeśli nie używamy safe area, zwróć zwykły View
    if (!safe) return(
        <View 
            style={[{backgroundColor: theme.background}, style]} 
            {...props}
        />
    );
    
    // Pobieranie wymiarów safe area (obszary bezpieczne urządzenia)
    const insets = useSafeAreaInsets();

    // Zwróć View z paddingiem uwzględniającym safe area
    return (
        <View 
            style={[
                {
                    backgroundColor: theme.background,
                    paddingTop: insets.top,       // Padding od góry (notch)
                    paddingBottom: insets.bottom  // Padding od dołu (przyciski)
                },
                style
            ]} 
            {...props}
        />
    );
}

export default ThemedView;
