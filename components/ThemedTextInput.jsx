/**
 * Komponent ThemedTextInput - Pole tekstowe dostosowane do motywu
 * 
 * Automatycznie zmienia kolor tła i tekstu w zależności od motywu systemowego
 */

import { TextInput, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

/**
 * @param {Object} style - Dodatkowe style
 * @param {Object} props - Inne właściwości przekazywane do TextInput
 */
const ThemedTextInput = ({ style, ...props}) => {
    // Pobieranie aktualnego motywu systemowego
    const colorScheme = useColorScheme();
    
    // Wybór palety kolorów
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
        <TextInput
            style={[
                {
                    backgroundColor: theme.uiBackground,  // Tło dla elementów UI
                    color: theme.text,                    // Kolor tekstu
                    padding: 20,
                    borderRadius: 6
                },
                style
            ]}
            placeholderTextColor={theme.iconColor}  // Kolor placeholder
            {...props}
        />
    );
}

export default ThemedTextInput;
