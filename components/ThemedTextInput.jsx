/**
 * Komponent ThemedTextInput - Pole tekstowe dostosowane do motywu
 * 
 * Automatycznie zmienia kolor tła i tekstu w zależności od motywu systemowego
 * 
 * Styl: Minimalistyczny z zaokrągleniami 14px
 */

import { TextInput, useColorScheme, View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

/**
 * @param {Object} style - Dodatkowe style
 * @param {string} icon - Nazwa ikony Ionicons (opcjonalna)
 * @param {Object} props - Inne właściwości przekazywane do TextInput
 */
const ThemedTextInput = ({ style, icon, ...props}) => {
    // Pobieranie aktualnego motywu systemowego
    const colorScheme = useColorScheme();
    
    // Wybór palety kolorów
    const theme = Colors[colorScheme] ?? Colors.light;
    
    if (icon) {
        return (
            <View style={[
                styles.inputContainer,
                { backgroundColor: theme.uiBackground },
                style
            ]}>
                <Ionicons name={icon} size={20} color={theme.iconColor} style={styles.icon} />
                <TextInput
                    style={[
                        styles.inputWithIcon,
                        { color: theme.text }
                    ]}
                    placeholderTextColor={theme.iconColor}
                    {...props}
                />
            </View>
        );
    }
  
    return (
        <TextInput
            style={[
                styles.input,
                {
                    backgroundColor: theme.uiBackground,
                    color: theme.text,
                },
                style
            ]}
            placeholderTextColor={theme.iconColor}
            {...props}
        />
    );
}

export default ThemedTextInput;

const styles = StyleSheet.create({
    input: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        fontSize: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 14,
    },
    icon: {
        marginRight: 10,
    },
    inputWithIcon: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
    },
});
