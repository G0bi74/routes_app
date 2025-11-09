/**
 * Komponent ThemedCard - Karta z zaokrąglonymi rogami
 * 
 * Kontener z tłem dostosowanym do motywu i zaokrąglonymi rogami
 * Używany do wyświetlania grup informacji (np. lista tras)
 */

import { StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "../constants/Colors";

/**
 * @param {Object} style - Dodatkowe style
 * @param {Object} props - Inne właściwości przekazywane do View
 */
const ThemedCard = ({style, ...props}) => {
    // Pobieranie aktualnego motywu systemowego
    const colorScheme = useColorScheme();
    
    // Wybór palety kolorów
    const theme = Colors[colorScheme] ?? Colors.light;

    return(
        <View 
            style={[
                {backgroundColor: theme.uiBackground},  // Tło dla elementów UI
                styles.card, 
                style
            ]} 
            {...props}
        />
    );
}

export default ThemedCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: 5,
        padding: 20
    }
});
