/**
 * Komponent ThemedCard - Karta z zaokrąglonymi rogami
 * 
 * Kontener z tłem dostosowanym do motywu i zaokrąglonymi rogami
 * Używany do wyświetlania grup informacji (np. lista tras)
 * 
 * Styl: Minimalistyczny z zaokrągleniami 16px
 */

import { StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "../constants/Colors";

/**
 * @param {Object} style - Dodatkowe style
 * @param {boolean} elevated - Czy dodać cień (domyślnie true)
 * @param {Object} props - Inne właściwości przekazywane do View
 */
const ThemedCard = ({style, elevated = true, ...props}) => {
    // Pobieranie aktualnego motywu systemowego
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    // Wybór palety kolorów
    const theme = Colors[colorScheme] ?? Colors.light;

    return(
        <View 
            style={[
                styles.card,
                { backgroundColor: theme.uiBackground },
                elevated && (isDark ? styles.elevatedDark : styles.elevatedLight),
                style
            ]} 
            {...props}
        />
    );
}

export default ThemedCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
    },
    elevatedLight: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    elevatedDark: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
});
