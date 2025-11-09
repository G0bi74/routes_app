/**
 * Komponent ThemedText - Tekst dostosowany do motywu aplikacji
 * 
 * Automatycznie zmienia kolor tekstu w zależności od:
 * - Motywu systemowego (jasny/ciemny)
 * - Czy jest to tytuł czy zwykły tekst
 */

import { Text, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";

/**
 * @param {Object} style - Dodatkowe style
 * @param {boolean} title - Czy tekst jest tytułem (używa innego koloru)
 * @param {Object} props - Inne właściwości przekazywane do Text
 */
const ThemedText = ({style, title = false, ...props}) => {
    // Pobieranie aktualnego motywu systemowego
    const colorScheme = useColorScheme();
    
    // Wybór palety kolorów (jasna lub ciemna)
    const theme = Colors[colorScheme] ?? Colors.light;

    // Wybór koloru tekstu w zależności czy to tytuł
    const textColor = title ? theme.title : theme.text;
    
    return(
        <Text 
            style={[{color: textColor}, style]}
            {...props}
        />
    );
}

export default ThemedText;
