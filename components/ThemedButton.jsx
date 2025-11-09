/**
 * Komponent ThemedButton - Przycisk dostosowany do motywu aplikacji
 * 
 * Przycisk z efektem przezroczystości po naciśnięciu
 * Używa głównego koloru aplikacji (primary)
 */

import { Pressable, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";

/**
 * @param {Object} style - Dodatkowe style
 * @param {Object} props - Inne właściwości przekazywane do Pressable (np. onPress, disabled)
 */
function ThemedButton({style, ...props}){
    return(
        <Pressable 
            // Dynamiczne style - zmienia opacity gdy przycisk jest wciśnięty
            style={({pressed}) => [
                styles.btn, 
                pressed && styles.pressed,  // Dodaje style pressed gdy wciśnięty
                style
            ]}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    btn:{
        backgroundColor: Colors.primary,  // Główny kolor aplikacji
        padding: 20,
        borderRadius: 6,
        marginVertical: 10
    },
    pressed: {
        opacity: 0.5  // Przezroczystość po naciśnięciu
    }
});

export default ThemedButton;
